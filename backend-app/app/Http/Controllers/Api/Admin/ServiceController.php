<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Tariff;
use App\Models\Meter;
use App\Models\MeterType;
use App\Services\TariffService;
use App\Services\BillingPeriodService;
use App\Services\TariffStatusService;
use App\Http\Resources\ServiceResource;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Validator;

class ServiceController extends Controller
{
    protected $tariffService;
    protected $billingPeriodService;
    protected $tariffStatusService;

    public function __construct(
        TariffService $tariffService,
        BillingPeriodService $billingPeriodService,
        TariffStatusService $tariffStatusService
    ) {
        $this->tariffService = $tariffService;
        $this->billingPeriodService = $billingPeriodService;
        $this->tariffStatusService = $tariffStatusService;
    }

    public function index()
    {
        $services = Service::with(['meterTypes', 'tariffs'])->get();
        return ServiceResource::collection($services);
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => ['required', 'string', 'max:30', 'unique:services'],
                'name' => 'required|string|max:100',
                'type' => 'required|string|max:20',
                'description' => 'nullable|string',
                'calculation_type' => ['required', Rule::in(['fixed', 'meter', 'area'])],
                'meter_type_ids' => 'required_if:calculation_type,meter|array',
                'meter_type_ids.*' => 'exists:meter_types,id',
                'is_active' => 'sometimes|boolean',
                'tariff_start_date' => [
                    'required',
                    'date',
                    function ($attribute, $value, $fail) {
                        // Проверяем, что дата - первое число месяца
                        if (!$this->billingPeriodService->validateStartDate($value)) {
                            $fail('Дата начала должна быть первым числом месяца (например: 01.01.2025).');
                            return;
                        }

                        // Получаем допустимые даты
                        $allowedDates = $this->billingPeriodService->getAllowedStartDates();
                        if (!in_array($value, $allowedDates)) {
                            $period = $this->billingPeriodService->getEditingPeriod();
                            $examples = $this->billingPeriodService->getDateExamples();
                            $exampleString = implode(', ', $examples);

                            if ($period['is_before_15th']) {
                                $fail("До 15 числа можно установить дату начала в прошлом, текущем или будущих месяцах. Примеры допустимых дат: {$exampleString}");
                            } else {
                                $fail("После 15 числа можно установить дату начала в текущем или будущих месяцах. Примеры допустимых дат: {$exampleString}");
                            }
                        }
                    }
                ],
            ], [
                'code.required' => 'Поле "Код услуги" обязательно для заполнения.',
                'code.unique' => 'Услуга с таким кодом уже существует. Пожалуйста, используйте другой код.',
                'code.string' => 'Код услуги должен быть строкой.',
                'code.max' => 'Код услуги не может превышать 30 символов.',

                'name.required' => 'Поле "Название услуги" обязательно для заполнения.',
                'name.string' => 'Название услуги должно быть строкой.',
                'name.max' => 'Название услуги не может превышать 100 символов.',

                'type.required' => 'Поле "Тип услуги" обязательно для выбора.',
                'type.string' => 'Тип услуги должен быть строкой.',
                'type.max' => 'Тип услуги не может превышать 20 символов.',

                'description.string' => 'Описание должно быть текстом.',

                'calculation_type.required' => 'Поле "Тип расчета" обязательно для выбора.',
                'calculation_type.in' => 'Выбран недопустимый тип расчета. Допустимые значения: фиксированный, по счетчику, по площади.',

                'meter_type_ids.required_if' => 'Для услуг по счетчикам необходимо выбрать хотя бы один тип счетчика.',
                'meter_type_ids.array' => 'Типы счетчиков должны быть переданы в виде массива.',
                'meter_type_ids.*.exists' => 'Выбран несуществующий тип счетчика.',

                'is_active.boolean' => 'Поле "Активна" должно быть логическим значением.',

                'tariff_start_date.required' => 'Поле "Дата начала тарифа" обязательно для заполнения.',
                'tariff_start_date.date' => 'Дата начала должна быть корректной датой в формате ДД.ММ.ГГГГ.',
            ]);

            if ($validator->fails()) {
                return $this->handleValidationErrors($validator, 'создать услугу');
            }

            $validated = $validator->validated();

            $service = DB::transaction(function () use ($validated) {
                $service = Service::create($validated);

                if ($service->calculation_type === 'meter' && isset($validated['meter_type_ids'])) {
                    $service->meterTypes()->sync($validated['meter_type_ids']);

                    if ($service->is_active) {
                        Meter::whereIn('type_id', $validated['meter_type_ids'])
                            ->update(['is_active' => true]);
                    }
                }

                $unit = $this->getUnitForService($service->calculation_type, $validated['meter_type_ids'] ?? []);

                Tariff::create([
                    'service_id' => $service->id,
                    'service_name'
                    => $service->name,
                    'rate' => 0.0000,
                    'unit' => $unit,
                    'start_date' => $validated['tariff_start_date'],
                    'end_date' => null,
                ]);

                return $service;
            });

            $service->load(['meterTypes', 'tariffs']);

            Log::info('Service created successfully', [
                'service_id' => $service->id,
                'service_name' => $service->name,
                'code' => $service->code
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Услуга успешно создана.',
                'data' => new ServiceResource($service)
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            Log::error('Service creation failed: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'exception' => $e
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Произошла ошибка при создании услуги. Пожалуйста, попробуйте позже.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function update(Request $request, Service $service)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => ['sometimes', 'string', 'max:30', Rule::unique('services')->ignore($service->id)],
                'name' => 'sometimes|string|max:100',
                'type' => 'required|string|max:20',
                'description' => 'nullable|string',
                'calculation_type' => ['sometimes', Rule::in(['fixed', 'meter', 'area'])],
                'meter_type_ids' => 'sometimes|array',
                'meter_type_ids.*' => 'exists:meter_types,id',
                'is_active' => 'sometimes|boolean'
            ], [
                'code.unique' => 'Услуга с таким кодом уже существует.',
                'meter_type_ids.*.exists' => 'Выбран несуществующий тип счетчика.'
            ]);

            if ($validator->fails()) {
                return $this->handleValidationErrors($validator, 'обновить услугу');
            }

            $validated = $validator->validated();

            DB::transaction(function () use ($service, $validated) {
                $originalCalculationType = $service->calculation_type;
                $originalIsActive = $service->is_active;
                $oldMeterTypeIds = $service->meterTypes->pluck('id')->toArray();

                $service->update($validated);

                // Всегда синхронизируем meter_type_ids, если они переданы
                if (array_key_exists('meter_type_ids', $validated)) {
                    $newMeterTypeIds = $service->calculation_type === 'meter'
                        ? $validated['meter_type_ids']
                        : [];

                    $service->meterTypes()->sync($newMeterTypeIds);
                }

                $newMeterTypeIds = $service->meterTypes->pluck('id')->toArray();

                $this->updateMetersActivation(
                    $originalIsActive,
                    $service->is_active,
                    $oldMeterTypeIds,
                    $newMeterTypeIds
                );

                // Обрабатываем изменение типа расчета
                if (
                    isset($validated['calculation_type']) &&
                    $validated['calculation_type'] !== $originalCalculationType
                ) {
                    $this->handleCalculationTypeChange($service, $validated);
                }            // ВАЖНОЕ ИСПРАВЛЕНИЕ: Также обрабатываем изменение meter_type_ids при calculation_type = 'meter'
                elseif (
                    $service->calculation_type === 'meter' &&
                    isset($validated['meter_type_ids']) &&
                    $oldMeterTypeIds != $validated['meter_type_ids']
                ) {
                    $this->handleMeterTypeIdsChange($service, $validated);
                }
            });

            $service->load(['meterTypes', 'tariffs']);

            Log::info('Service updated successfully', [
                'service_id' => $service->id,
                'code' => $service->code,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Услуга успешно обновлена.',
                'data' => new ServiceResource($service)
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            Log::error('Service update failed: ' . $e->getMessage(), [
                'service_id' => $service->id,
                'request_data' => $request->all(),
                'exception' => $e
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Произошла ошибка при обновлении услуги. Пожалуйста, попробуйте позже.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy(Service $service)
    {
        try {
            DB::transaction(function () use ($service) {

                $period = $this->billingPeriodService->getEditingPeriod();

                $tariffs = $service->tariffs;

                // 1. Удаляем будущие тарифы
                $futureTariffs = $tariffs->filter(function ($tariff) {
                    return $this->tariffStatusService->getStatus($tariff) === 'future';
                });
                foreach ($futureTariffs as $tariff) {
                    $tariff->delete();
                }

                // 2. Обрабатываем активные тарифы
                $currentTariffs = $tariffs->filter(function ($tariff) {
                    return $this->tariffStatusService->getStatus($tariff) === 'current';
                });

                foreach ($currentTariffs as $tariff) {
                    $startDate = Carbon::parse($tariff->start_date);

                    if ($period['is_before_15th']) {
                        // До 15 числа
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
                        // После 15 числа
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
            });

            Log::info('Service deleted successfully', [
                'service_id' => $service->id,
                'code' => $service->code
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Услуга успешно удалена.'
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            Log::error('Service deletion failed: ' . $e->getMessage(), [
                'service_id' => $service->id,
                'exception' => $e
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Произошла ошибка при удалении услуги. Пожалуйста, попробуйте позже.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function toggleActive(Service $service)
    {
        $newStatus = !$service->is_active;

        DB::transaction(function () use ($service, $newStatus) {
            $service->update(['is_active' => $newStatus]);

            if ($service->calculation_type === 'meter') {
                $meterTypeIds = $service->meterTypes->pluck('id')->toArray();
                if (!empty($meterTypeIds)) {
                    Meter::whereIn('type_id', $meterTypeIds)
                        ->update(['is_active' => $newStatus]);
                }
            }
        });

        $service->load(['meterTypes', 'tariffs']);
        return response()->json([
            'success' => true,
            'message' => 'Статус услуги изменен',
            'data' => new ServiceResource($service)
        ]);
    }

    public function show(Request $request)
    {
        try {
            $services = Service::where('is_active', true)
                ->with(['tariffs' => function ($query) {
                    $query->where(function ($q) {
                        $q->whereNull('end_date')
                            ->orWhere('end_date', '>', now());
                    });
                }, 'meterTypes'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => ServiceResource::collection($services)
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            Log::error('ServiceController show error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении услуг'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    protected function handleValidationErrors($validator, $action = 'выполнить операцию')
    {
        $errorMessages = [];
        foreach ($validator->errors()->toArray() as $field => $errors) {
            foreach ($errors as $error) {
                $errorMessages[] = $error;
            }
        }

        $detailedMessage = implode(' ', $errorMessages);

        return response()->json([
            'success' => false,
            'message' => "Не удалось {$action}. {$detailedMessage}",
            'errors' => $validator->errors()
        ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

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

    protected function updateMetersActivation($oldIsActive, $newIsActive, $oldMeterTypeIds, $newMeterTypeIds)
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
            // Деактивируем старые
            $typesToDeactivate = array_diff($oldMeterTypeIds, $newMeterTypeIds);
            if (!empty($typesToDeactivate)) {
                Meter::whereIn('type_id', $typesToDeactivate)->update(['is_active' => false]);
            }
            // Активируем новые
            if (!empty($newMeterTypeIds)) {
                Meter::whereIn('type_id', $newMeterTypeIds)->update(['is_active' => true]);
            }
        }
    }

    protected function handleCalculationTypeChange(Service $service, array $validated)
    {
        $period = $this->billingPeriodService->getEditingPeriod();
        $newUnit = $this->getUnitForService(
            $validated['calculation_type'],
            $validated['meter_type_ids'] ?? []
        );

        // Получаем ВСЕ тарифы услуги
        $tariffs = $service->tariffs;

        if ($tariffs->isEmpty()) {
            // Если нет тарифов, создаем новый
            $this->createNewTariff($service, $newUnit, $period);
            return;
        }

        // 1. Обрабатываем ВСЕ будущие тарифы
        $this->handleFutureTariffs($tariffs, $newUnit);

        // 2. Обрабатываем активные тарифы
        $this->handleCurrentTariffs($service, $tariffs, $newUnit, $period);
    }

    /**
     * Обработка ВСЕХ будущих тарифов
     */
    protected function handleFutureTariffs($tariffs, $newUnit)
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
     */
    protected function handleCurrentTariffs(Service $service, $tariffs, $newUnit, $period)
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
    protected function handleBefore15th(Service $service, $tariff, $startDate, $newUnit, $period)
    {
        if ($startDate->equalTo($period['active_start'])) {
            // start_date = 1 число предыдущего месяца - обновляем unit
            $tariff->update(['unit' => $newUnit]);

            Log::info('Current tariff unit updated (before 15th)', [
                'tariff_id' => $tariff->id,
                'start_date' => $tariff->start_date,
                'active_start' => $period['active_start']->format('Y-m-d'),
                'new_unit' => $newUnit
            ]);
        } else {
            // start_date < 1 число предыдущего месяца - устанавливаем end_date и создаем новый
            $tariff->update(['end_date' => $period['two_months_ago_end']]);

            $this->createNewTariff($service, $newUnit, $period);

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
    protected function handleAfter15th(Service $service, $tariff, $startDate, $newUnit, $period)
    {
        if ($startDate->equalTo($period['active_start'])) {
            // start_date = 1 число текущего месяца - обновляем unit
            $tariff->update(['unit' => $newUnit]);

            Log::info('Current tariff unit updated (after 15th)', [
                'tariff_id' => $tariff->id,
                'start_date' => $tariff->start_date,
                'active_start' => $period['active_start']->format('Y-m-d'),
                'new_unit' => $newUnit
            ]);
        } else {
            // start_date < 1 число текущего месяца - устанавливаем end_date и создаем новый
            $tariff->update(['end_date' => $period['previous_month_end']]);

            $this->createNewTariff($service, $newUnit, $period);

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
     */
    protected function createNewTariff(Service $service, $unit, $period)
    {
        $tariff = Tariff::create([
            'service_id' => $service->id,
            'service_name' => $service->name,
            'rate' => 0.0000,
            'unit' => $unit,
            'start_date' => $period['active_start'],
            'end_date' => null,
        ]);

        Log::info('New tariff created during calculation type change', [
            'tariff_id' => $tariff->id,
            'service_id' => $service->id,
            'unit' => $unit,
            'start_date' => $period['active_start']->format('Y-m-d')
        ]);

        return $tariff;
    }

    /**
     * Обработка изменения типов счетчиков при том же calculation_type = 'meter'
     */
    protected function handleMeterTypeIdsChange(Service $service, array $validated)
    {
        $period = $this->billingPeriodService->getEditingPeriod();
        $newUnit = $this->getUnitForService(
            'meter', // calculation_type остается 'meter'
            $validated['meter_type_ids']
        );

        // Получаем ВСЕ тарифы услуги
        $tariffs = $service->tariffs;

        if ($tariffs->isEmpty()) {
            // Если нет тарифов, создаем новый
            $this->createNewTariff($service, $newUnit, $period);
            return;
        }

        // 1. Обрабатываем ВСЕ будущие тарифы
        $this->handleFutureTariffs($tariffs, $newUnit);

        // 2. Обрабатываем активные тарифы
        $this->handleCurrentTariffs($service, $tariffs, $newUnit, $period);
    }
}
