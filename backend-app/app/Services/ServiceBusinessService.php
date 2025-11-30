<?php

namespace App\Services;

use App\Models\Service;
use App\Models\Tariff;
use App\Models\Meter;
use App\Models\MeterType;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Сервис для бизнес-логики операций с услугами
 * 
 * @see \App\Http\Controllers\Api\Admin\ServiceController
 * @uses \App\Models\Service
 * @uses \App\Models\Tariff
 * @uses \App\Models\Meter
 * @uses \App\Services\BillingPeriodService
 * @uses \App\Services\TariffStatusService
 */
class ServiceBusinessService
{
    protected $billingPeriodService;
    protected $tariffStatusService;

    public function __construct(
        BillingPeriodService $billingPeriodService,
        TariffStatusService $tariffStatusService
    ) {
        $this->billingPeriodService = $billingPeriodService;
        $this->tariffStatusService = $tariffStatusService;
    }

    /**
     * Валидация даты начала тарифа при создании услуги
     * 
     * @see \App\Http\Controllers\Api\Admin\ServiceController::store()
     * @uses \App\Services\BillingPeriodService::validateStartDate()
     * @uses \App\Services\BillingPeriodService::getAllowedStartDates()
     * @uses \App\Services\BillingPeriodService::getEditingPeriod()
     * @uses \App\Services\BillingPeriodService::getDateExamples()
     * 
     * @param string $date Дата начала тарифа
     * @return array Массив ошибок валидации
     */
    public function validateTariffStartDate($date): array
    {
        $errors = [];

        // Проверяем, что дата - первое число месяца
        if (!$this->billingPeriodService->validateStartDate($date)) {
            $errors[] = 'Дата начала должна быть первым числом месяца (например: 01.01.2025).';
            return $errors;
        }

        // Получаем допустимые даты
        $allowedDates = $this->billingPeriodService->getAllowedStartDates();
        if (!in_array($date, $allowedDates)) {
            $period = $this->billingPeriodService->getEditingPeriod();
            $examples = $this->billingPeriodService->getDateExamples();
            $exampleString = implode(', ', $examples);

            if ($period['is_before_15th']) {
                $errors[] = "До 15 числа можно установить дату начала в прошлом, текущем или будущих месяцах. Примеры допустимых дат: {$exampleString}";
            } else {
                $errors[] = "После 15 числа можно установить дату начала в текущем или будущих месяцах. Примеры допустимых дат: {$exampleString}";
            }
        }

        return $errors;
    }

    /**
     * Создание начального тарифа для новой услуги
     * 
     * @see \App\Http\Controllers\Api\Admin\ServiceController::store()
     * @uses self::getUnitForService() Определение единицы измерения
     * @uses self::createNewTariff() Создание тарифа
     * 
     * @param Service $service Созданная услуга
     * @param array $validatedData Валидированные данные
     * @return Tariff Созданный тариф
     */
    public function createInitialTariff(Service $service, array $validatedData): Tariff
    {
        $unit = $this->getUnitForService($service->calculation_type, $validatedData['meter_type_ids'] ?? []);
        $startDate = Carbon::parse($validatedData['tariff_start_date']);

        return $this->createNewTariff($service, $unit, $startDate);
    }

    /**
     * Удаление услуги с обработкой связанных тарифов
     * 
     * @see \App\Http\Controllers\Api\Admin\ServiceController::destroy()
     * @uses \App\Services\TariffStatusService::getStatus() Определение статуса тарифов
     * @uses \App\Services\BillingPeriodService::getEditingPeriod() Получение текущего периода редактирования
     * @uses \App\Models\Tariff::delete() Удаление тарифов
     * @uses \App\Models\Tariff::update() Архивация тарифов
     * @uses \App\Models\Service::delete() Удаление услуги
     */
    public function deleteService(Service $service): void
    {
        DB::transaction(function () use ($service) {
            $period = $this->billingPeriodService->getEditingPeriod();
            $tariffs = $service->tariffs;

            // 1. Удаляем планируемые тарифы
            $futureTariffs = $tariffs->filter(function ($tariff) {
                return $this->tariffStatusService->getStatus($tariff) === 'future';
            });

            foreach ($futureTariffs as $tariff) {
                $tariff->delete();
                Log::info('Future tariff deleted during service deletion', [
                    'tariff_id' => $tariff->id,
                    'start_date' => $tariff->start_date,
                ]);
            }

            // 2. Обрабатываем действующие тарифы
            $currentTariffs = $tariffs->filter(function ($tariff) {
                return $this->tariffStatusService->getStatus($tariff) === 'current';
            });

            foreach ($currentTariffs as $tariff) {
                $startDate = Carbon::parse($tariff->start_date);

                if ($period['is_before_15th']) {
                    if ($startDate->equalTo($period['active_start'])) {
                        $tariff->delete();
                        Log::info('Active tariff deleted (before 15th)', [
                            'tariff_id' => $tariff->id,
                            'start_date' => $tariff->start_date,
                            'active_start' => $period['active_start']->format('Y-m-d')
                        ]);
                    } else {
                        $tariff->update(['end_date' => $period['two_months_ago_end']]);
                        Log::info('Active tariff ended (before 15th)', [
                            'tariff_id' => $tariff->id,
                            'start_date' => $tariff->start_date,
                            'end_date' => $period['two_months_ago_end']->format('Y-m-d')
                        ]);
                    }
                } else {
                    if ($startDate->equalTo($period['active_start'])) {
                        $tariff->delete();
                        Log::info('Active tariff deleted (after 15th)', [
                            'tariff_id' => $tariff->id,
                            'start_date' => $tariff->start_date,
                            'active_start' => $period['active_start']->format('Y-m-d')
                        ]);
                    } else {
                        $tariff->update(['end_date' => $period['previous_month_end']]);
                        Log::info('Active tariff ended (after 15th)', [
                            'tariff_id' => $tariff->id,
                            'start_date' => $tariff->start_date,
                            'end_date' => $period['previous_month_end']->format('Y-m-d')
                        ]);
                    }
                }
            }

            // 3. Удаляем тарифы с rate=0.0000
            $service->tariffs()->where('rate', 0.0000)->delete();

            // 4. Отвязываем типы счетчиков и удаляем услугу
            $service->meterTypes()->detach();
            $service->delete();

            Log::info('Service deleted successfully', [
                'service_id' => $service->id,
                'code' => $service->code
            ]);
        });
    }

    /**
     * Обработка изменения типа расчета услуги
     * 
     * @see \App\Http\Controllers\Api\Admin\ServiceController::update()
     * @uses \App\Services\BillingPeriodService::getEditingPeriod() Получение периода редактирования
     * @uses self::handleFutureTariffs() Обработка будущих тарифов
     * @uses self::handleCurrentTariffs() Обработка текущих тарифов
     * @uses self::createNewTariff() Создание нового тарифа
     */
    public function handleCalculationTypeChange(Service $service, array $validated): void
    {
        $period = $this->billingPeriodService->getEditingPeriod();
        $newUnit = $this->getUnitForService(
            $validated['calculation_type'],
            $validated['meter_type_ids'] ?? []
        );

        $tariffs = $service->tariffs;

        if ($tariffs->isEmpty()) {
            $this->createNewTariff($service, $newUnit, $period['active_start']);
            return;
        }

        $this->handleFutureTariffs($tariffs, $newUnit);
        $this->handleCurrentTariffs($service, $tariffs, $newUnit, $period);
    }

    /**
     * Обработка изменения типов счетчиков
     * 
     * @see \App\Http\Controllers\Api\Admin\ServiceController::update()
     * @uses \App\Services\BillingPeriodService::getEditingPeriod() Получение периода редактирования
     * @uses self::handleFutureTariffs() Обработка будущих тарифов
     * @uses self::handleCurrentTariffs() Обработка текущих тарифов
     */
    public function handleMeterTypeIdsChange(Service $service, array $validated): void
    {
        $period = $this->billingPeriodService->getEditingPeriod();
        $newUnit = $this->getUnitForService('meter', $validated['meter_type_ids']);

        $tariffs = $service->tariffs;

        if ($tariffs->isEmpty()) {
            $this->createNewTariff($service, $newUnit, $period['active_start']);
            return;
        }

        $this->handleFutureTariffs($tariffs, $newUnit);
        $this->handleCurrentTariffs($service, $tariffs, $newUnit, $period);
    }

    /**
     * Обработка ВСЕХ будущих тарифов
     * 
     * @uses \App\Services\TariffStatusService::getStatus() Определение статуса тарифов
     * @uses \App\Models\Tariff::update() Обновление единицы измерения
     */
    protected function handleFutureTariffs($tariffs, $newUnit): void
    {
        $futureTariffs = $tariffs->filter(function ($tariff) {
            return $this->tariffStatusService->getStatus($tariff) === 'future';
        });

        foreach ($futureTariffs as $tariff) {
            $tariff->update(['unit' => $newUnit]);

            Log::info('Future tariff unit updated during calculation type change', [
                'tariff_id' => $tariff->id,
                'old_unit' => $tariff->getOriginal('unit'),
                'new_unit' => $newUnit,
                'start_date' => $tariff->start_date
            ]);
        }
    }

    /**
     * Обработка активных тарифов
     * 
     * @uses \App\Services\TariffStatusService::getStatus() Определение статуса тарифов
     * @uses \App\Models\Tariff::update() Обновление тарифов
     * @uses self::createNewTariff() Создание нового тарифа
     */
    protected function handleCurrentTariffs(Service $service, $tariffs, $newUnit, $period): void
    {
        $currentTariffs = $tariffs->filter(function ($tariff) {
            return $this->tariffStatusService->getStatus($tariff) === 'current';
        });

        foreach ($currentTariffs as $tariff) {
            $startDate = Carbon::parse($tariff->start_date);

            if ($period['is_before_15th']) {
                $this->handleBefore15th($service, $tariff, $startDate, $newUnit, $period);
            } else {
                $this->handleAfter15th($service, $tariff, $startDate, $newUnit, $period);
            }
        }
    }

    /**
     * Обработка до 15 числа
     */
    protected function handleBefore15th(Service $service, $tariff, $startDate, $newUnit, $period): void
    {
        if ($startDate->equalTo($period['active_start'])) {
            $tariff->update(['unit' => $newUnit]);
            Log::info('Current tariff unit updated (before 15th)', [
                'tariff_id' => $tariff->id,
                'start_date' => $tariff->start_date,
                'active_start' => $period['active_start']->format('Y-m-d'),
                'new_unit' => $newUnit
            ]);
        } else {
            $tariff->update(['end_date' => $period['two_months_ago_end']]);
            $this->createNewTariff($service, $newUnit, $period['active_start']);
            Log::info('Current tariff ended and new created (before 15th)', [
                'old_tariff_id' => $tariff->id,
                'end_date' => $period['two_months_ago_end']->format('Y-m-d'),
                'new_start_date' => $period['active_start']->format('Y-m-d'),
                'new_unit' => $newUnit
            ]);
        }
    }

    /**
     * Обработка после 15 числа
     */
    protected function handleAfter15th(Service $service, $tariff, $startDate, $newUnit, $period): void
    {
        if ($startDate->equalTo($period['active_start'])) {
            $tariff->update(['unit' => $newUnit]);
            Log::info('Current tariff unit updated (after 15th)', [
                'tariff_id' => $tariff->id,
                'start_date' => $tariff->start_date,
                'active_start' => $period['active_start']->format('Y-m-d'),
                'new_unit' => $newUnit
            ]);
        } else {
            $tariff->update(['end_date' => $period['previous_month_end']]);
            $this->createNewTariff($service, $newUnit, $period['active_start']);
            Log::info('Current tariff ended and new created (after 15th)', [
                'old_tariff_id' => $tariff->id,
                'end_date' => $period['previous_month_end']->format('Y-m-d'),
                'new_start_date' => $period['active_start']->format('Y-m-d'),
                'new_unit' => $newUnit
            ]);
        }
    }



    /**
     * Создание нового тарифа
     * 
     * @uses \App\Models\Tariff::create() Создание тарифа
     */
    public function createNewTariff(Service $service, $unit, $startDate): Tariff
    {
        $tariff = Tariff::create([
            'service_id' => $service->id,
            'service_name' => $service->name,
            'rate' => 0.0000,
            'unit' => $unit,
            'start_date' => $startDate,
            'end_date' => null,
        ]);

        Log::info('New tariff created during calculation type change', [
            'tariff_id' => $tariff->id,
            'service_id' => $service->id,
            'unit' => $unit,
            'start_date' => $startDate->format('Y-m-d')
        ]);

        return $tariff;
    }

    /**
     * Обновление активации счетчиков
     * 
     * @see \App\Http\Controllers\Api\Admin\ServiceController::update()
     * @uses \App\Models\Meter::update() Обновление статуса счетчиков
     */
    public function updateMetersActivation($oldIsActive, $newIsActive, $oldMeterTypeIds, $newMeterTypeIds): void
    {
        // Деактивация при изменении статуса услуги
        if ($oldIsActive && !$newIsActive) {
            $allMeterTypeIds = array_unique(array_merge($oldMeterTypeIds, $newMeterTypeIds));
            if (!empty($allMeterTypeIds)) {
                Meter::whereIn('type_id', $allMeterTypeIds)->update(['is_active' => false]);
            }
        }
        // Активация при изменении статуса услуги
        elseif (!$oldIsActive && $newIsActive) {
            if (!empty($newMeterTypeIds)) {
                Meter::whereIn('type_id', $newMeterTypeIds)->update(['is_active' => true]);
            }
        }
        // Если услуга активна и изменились привязки счетчиков
        elseif ($newIsActive && $oldMeterTypeIds != $newMeterTypeIds) {
            $typesToDeactivate = array_diff($oldMeterTypeIds, $newMeterTypeIds);
            if (!empty($typesToDeactivate)) {
                Meter::whereIn('type_id', $typesToDeactivate)->update(['is_active' => false]);
            }
            if (!empty($newMeterTypeIds)) {
                Meter::whereIn('type_id', $newMeterTypeIds)->update(['is_active' => true]);
            }
        }
    }

    /**
     * Получение единицы измерения для услуги
     * 
     * @uses \App\Models\MeterType::find()
     * 
     * @param string $calculationType Тип расчета
     * @param array $meterTypeIds ID типов счетчиков
     * @return string Единица измерения
     */
    protected function getUnitForService($calculationType, array $meterTypeIds = []): string
    {
        if ($calculationType === 'meter' && !empty($meterTypeIds)) {
            $firstMeterType = MeterType::find($meterTypeIds[0]);
            if ($firstMeterType && $firstMeterType->unit) {
                return $firstMeterType->unit;
            }
        }

        return match ($calculationType) {
            'fixed' => 'fixed',
            'meter' => 'm3',
            'area' => 'm2',
            default => 'fixed',
        };
    }
}
