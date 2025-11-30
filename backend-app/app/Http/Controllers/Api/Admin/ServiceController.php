<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Meter;
use App\Services\ServiceBusinessService;
use App\Http\Resources\ServiceResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Validator;

/**
 * Контроллер для управления услугами
 * 
 * @see \App\Models\Service Модель услуги
 * @see \App\Services\ServiceBusinessService Сервис бизнес-логики услуг
 * @uses \App\Http\Resources\ServiceResource Ресурс для форматирования услуг
 */
class ServiceController extends Controller
{
    protected $serviceBusinessService;

    /**
     * Конструктор контроллера
     * 
     * @param ServiceBusinessService $serviceBusinessService Сервис бизнес-логики услуг
     */
    public function __construct(
        ServiceBusinessService $serviceBusinessService
    ) {
        $this->serviceBusinessService = $serviceBusinessService;
    }

    /**
     * Получить список всех услуг
     * 
     * @see \App\Models\Service Модель услуги
     * @uses \App\Http\Resources\ServiceResource Коллекция ресурсов услуг
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $services = Service::with(['meterTypes', 'tariffs'])->get();
        return ServiceResource::collection($services);
    }

    /**
     * Создать новую услугу
     * 
     * @see \App\Services\ServiceBusinessService::validateTariffStartDate() Валидация даты тарифа
     * @see \App\Services\ServiceBusinessService::createNewTariff() Создание тарифа
     * @uses \Illuminate\Validation\Validator Валидация входных данных
     * @uses \App\Models\Service::create() Создание услуги
     * @uses \App\Models\Meter::update() Активация счетчиков
     * 
     * @param Request $request HTTP запрос
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // 1. Первичная валидация входных данных
            $validator = Validator::make($request->all(), [
                'code' => ['required', 'string', 'max:30', 'unique:services'],
                'name' => 'required|string|max:100',
                'type' => 'required|string|max:20',
                'description' => 'nullable|string',
                'calculation_type' => ['required', Rule::in(['fixed', 'meter', 'area'])],
                'meter_type_ids' => 'required_if:calculation_type,meter|array',
                'meter_type_ids.*' => 'exists:meter_types,id',
                'is_active' => 'sometimes|boolean',
                'tariff_start_date' => 'required|date',
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

            // 2. Бизнес-валидация даты начала тарифа
            $businessErrors = $this->serviceBusinessService->validateTariffStartDate($validated['tariff_start_date']);
            if (!empty($businessErrors)) {
                return $this->handleValidationErrors($businessErrors, 'создать услугу');
            }

            // 3. Создание услуги и связанных данных
            $service = DB::transaction(function () use ($validated) {
                $service = Service::create($validated);

                // Привязка типов счетчиков если необходимо
                if ($service->calculation_type === 'meter' && isset($validated['meter_type_ids'])) {
                    $service->meterTypes()->sync($validated['meter_type_ids']);

                    // Активация счетчиков если услуга активна
                    if ($service->is_active) {
                        Meter::whereIn('type_id', $validated['meter_type_ids'])
                            ->update(['is_active' => true]);
                    }
                }

                // Создание начального тарифа через сервис
                $this->serviceBusinessService->createInitialTariff($service, $validated);

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

    /**
     * Обновить существующую услугу
     * 
     * @see \App\Services\ServiceBusinessService::updateMetersActivation() Обновление счетчиков
     * @see \App\Services\ServiceBusinessService::handleCalculationTypeChange() Изменение типа расчета
     * @see \App\Services\ServiceBusinessService::handleMeterTypeIdsChange() Изменение типов счетчиков
     * @uses \Illuminate\Validation\Validator Валидация входных данных
     * @uses \App\Models\Service::update() Обновление услуги
     * 
     * @param Request $request HTTP запрос
     * @param Service $service Обновляемая услуга
     * @return \Illuminate\Http\JsonResponse
     */
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

                // Обновление активации счетчиков через бизнес-сервис
                $this->serviceBusinessService->updateMetersActivation(
                    $originalIsActive,
                    $service->is_active,
                    $oldMeterTypeIds,
                    $newMeterTypeIds
                );

                // Обработка изменения типа расчета через бизнес-сервис
                if (
                    isset($validated['calculation_type']) &&
                    $validated['calculation_type'] !== $originalCalculationType
                ) {
                    $this->serviceBusinessService->handleCalculationTypeChange($service, $validated);
                }
                // Обработка изменения типов счетчиков при том же calculation_type = 'meter'
                elseif (
                    $service->calculation_type === 'meter' &&
                    isset($validated['meter_type_ids']) &&
                    $oldMeterTypeIds != $validated['meter_type_ids']
                ) {
                    $this->serviceBusinessService->handleMeterTypeIdsChange($service, $validated);
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

    /**
     * Удалить услугу
     * 
     * @see \App\Services\ServiceBusinessService::deleteService() Бизнес-логика удаления
     * @uses \App\Services\ServiceBusinessService Основной сервис бизнес-логики
     * 
     * @param Service $service Удаляемая услуга
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Service $service)
    {
        try {
            $this->serviceBusinessService->deleteService($service);

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

    /**
     * Переключить статус активности услуги
     * 
     * @uses \App\Models\Service::update() Обновление статуса услуги
     * @uses \App\Models\Meter::update() Обновление статуса счетчиков
     * 
     * @param Service $service Услуга
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Получить активные услуги с текущими тарифами
     * 
     * @see \App\Models\Service Модель услуги
     * @uses \App\Http\Resources\ServiceResource Коллекция ресурсов услуг
     * 
     * @param Request $request HTTP запрос
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Обработка ошибок валидации (унифицированная)
     * 
     * @param mixed $errors Объект Validator или массив ошибок
     * @param string $action Действие, которое выполнялось
     * @return \Illuminate\Http\JsonResponse
     */
    protected function handleValidationErrors($errors, $action = 'выполнить операцию')
    {
        $errorMessages = [];

        if ($errors instanceof \Illuminate\Validation\Validator) {
            // Обработка ошибок от Validator
            foreach ($errors->errors()->toArray() as $field => $fieldErrors) {
                foreach ($fieldErrors as $error) {
                    $errorMessages[] = $error;
                }
            }
            $responseErrors = $errors->errors();
        } else {
            // Обработка массива ошибок бизнес-логики
            foreach ($errors as $error) {
                $errorMessages[] = $error;
            }
            $responseErrors = ['tariff_start_date' => $errors];
        }

        $detailedMessage = implode(' ', $errorMessages);

        return response()->json([
            'success' => false,
            'message' => "Не удалось {$action}. {$detailedMessage}",
            'errors' => $responseErrors
        ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}
