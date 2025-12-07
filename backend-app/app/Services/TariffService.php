<?php

namespace App\Services;

use App\Traits\CollectsMetrics;
use App\Models\Tariff;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * Сервис для работы с тарифами
 * 
 * @see \App\Http\Controllers\Api\Admin\TariffController
 * @see \App\Http\Controllers\Api\Admin\ServiceController
 * @uses \App\Models\Tariff
 */
class TariffService
{

    use CollectsMetrics;

    /**
     * Проверка возможности редактирования тарифа
     * @see \App\Http\Controllers\Api\Admin\TariffController::update()
     * @uses \App\Models\Tariff::isExpired()
     */
    public function canEditTariff(Tariff $tariff): bool
    {
        return !$tariff->isExpired();
    }

    /**
     * Валидация изменений дат тарифа
     * @see \App\Http\Controllers\Api\Admin\TariffController::update()
     * @uses Carbon::parse()
     */
    public function validateDateChanges(Tariff $tariff, array $validated): array
    {
        $errors = [];

        if (isset($validated['start_date'])) {
            $newStartDate = Carbon::parse($validated['start_date']);
            $currentStartDate = Carbon::parse($tariff->start_date);

            // Проверяем, действительно ли дата изменилась
            $startDateChanged = !$newStartDate->equalTo($currentStartDate);

            if ($startDateChanged) {
                // ЗАПРЕЩАЕМ изменение start_date для ЛЮБОГО тарифа
                $errors['start_date'] = 'Изменение даты начала тарифа запрещено. Дата начала устанавливается при создании тарифа и не может быть изменена.';
            }
        }

        return $errors;
    }

    /**
     * Валидация дат для нового тарифа
     * @see \App\Http\Controllers\Api\Admin\TariffController::store()
     * @uses \App\Models\Tariff::where()
     */
    public function validateNewTariffDates($serviceId, $startDate, $endDate = null): array
    {
        $errors = [];
        $startDate = Carbon::parse($startDate);
        $endDate = $endDate ? Carbon::parse($endDate) : null;

        // Проверка пересечения с существующими тарифами
        $overlappingTariff = Tariff::where('service_id', $serviceId)
            ->where(function ($query) use ($startDate, $endDate) {
                $query->where(function ($q) use ($startDate, $endDate) {
                    if ($endDate) {
                        $q->whereBetween('start_date', [$startDate, $endDate])
                            ->orWhereBetween('end_date', [$startDate, $endDate])
                            ->orWhere(function ($q) use ($startDate, $endDate) {
                                $q->where('start_date', '<=', $startDate)
                                    ->where('end_date', '>=', $endDate);
                            });
                    } else {
                        $q->where('start_date', '<=', $startDate)
                            ->where(function ($q) use ($startDate) {
                                $q->whereNull('end_date')
                                    ->orWhere('end_date', '>=', $startDate);
                            });
                    }
                });
            })
            ->first();

        if ($overlappingTariff) {
            $errors['start_date'] = 'Новая дата начала пересекается с существующим тарифом (ID: ' .
                $overlappingTariff->id . '), который действует с ' .
                $overlappingTariff->start_date->format('d.m.Y') . ' по ' .
                ($overlappingTariff->end_date ? $overlappingTariff->end_date->format('d.m.Y') : 'настоящее время') . '.';
        }

        // Проверка что start_date не в далеком будущем
        if ($startDate->gt(Carbon::now()->addYears(10))) {
            $errors['start_date'] = 'Дата начала не может быть более чем на 10 лет в будущем.';
        }

        if ($endDate && $endDate->gt(Carbon::now()->addYears(10))) {
            $errors['end_date'] = 'Дата окончания не может быть более чем на 10 лет в будущем.';
        }

        return $errors;
    }

    /**
     * Обработка изменения end_date тарифа
     * @see \App\Http\Controllers\Api\Admin\TariffController::update()
     * @uses \App\Models\Tariff::where()
     * @uses \App\Models\Tariff::update()
     * @uses Log::info()
     * @uses Log::debug()
     */

    public function handleEndDateChange(Tariff $tariff, $newEndDate)
    {
        $nextStartDate = Carbon::parse($newEndDate)->addDay();

        // Ищем следующий тариф (который начинается сразу после текущего end_date)
        $nextTariff = Tariff::where('service_id', $tariff->service_id)
            ->where('start_date', '>', $tariff->start_date)
            ->orderBy('start_date', 'asc')
            ->first();

        if ($nextTariff) {
            // Если следующий тариф существует - обновляем его start_date
            $nextTariff->update([
                'start_date' => $nextStartDate
            ]);

            Log::info('Next tariff start_date updated', [
                'previous_tariff_id' => $tariff->id,
                'next_tariff_id' => $nextTariff->id,
                'old_start_date' => $nextTariff->getOriginal('start_date'),
                'new_start_date' => $nextStartDate
            ]);
        } else {
            // Если следующего тарифа нет - создаем новый
            Tariff::create([
                'service_id' => $tariff->service_id,
                'rate' => 0.0000,
                'unit' => $tariff->unit,
                'start_date' => $nextStartDate,
                'end_date' => null
            ]);

            Log::info('New tariff created', [
                'previous_tariff_id' => $tariff->id,
                'next_start_date' => $nextStartDate,
                'service_id' => $tariff->service_id,
                'rate' => 0.0000
            ]);
        }
        Log::debug('Handling end date change details', [
            'current_tariff_id' => $tariff->id,
            'current_start_date' => $tariff->start_date->format('Y-m-d'),
            'current_end_date' => $tariff->end_date ? $tariff->end_date->format('Y-m-d') : null,
            'new_end_date' => $newEndDate->format('Y-m-d'),
            'calculated_next_start_date' => $nextStartDate->format('Y-m-d'),
            'next_tariff_found' => (bool)$nextTariff,
            'next_tariff_id' => $nextTariff ? $nextTariff->id : null,
            'next_tariff_old_start_date' => $nextTariff ? $nextTariff->start_date->format('Y-m-d') : null
        ]);
    }

    /**
     * Создание следующего тарифа при установке end_date
     */
    public function createNextTariff(Tariff $tariff, $endDate)
    {
        $nextStartDate = Carbon::parse($endDate)->addDay();

        // Создаем следующий тариф согласно требованию 6
        Tariff::create([
            'service_id' => $tariff->service_id,
            'rate' => 0.0000,
            'unit' => $tariff->unit,
            'start_date' => $nextStartDate,
            'end_date' => null
        ]);

        Log::debug('Creating next tariff details', [
            'current_tariff_start_date' => $tariff->start_date,
            'current_tariff_end_date' => $tariff->end_date,
            'new_end_date' => $endDate,
            'calculated_next_start_date' => $nextStartDate->format('Y-m-d'),
            'today_date' => Carbon::today()->format('Y-m-d')
        ]);
    }

    /**
     * Проверяет, можно ли удалить тариф
     * Разрешаем удаление только архивных тарифов
     */
    public function canDeleteTariff(Tariff $tariff): bool
    {
        // Разрешаем удаление только архивных тарифов
        return $tariff->isExpired();
    }

    /**
     * Получить архивные тарифы для услуги
     */
    public function getExpiredTariffs($serviceId)
    {
        return Tariff::where('service_id', $serviceId)
            ->expired()
            ->orderBy('start_date', 'desc')
            ->get();
    }

    /**
     * Получить тарифы, которые можно удалить
     */
    public function getDeletableTariffs($serviceId)
    {
        return $this->getExpiredTariffs($serviceId);
    }
}
