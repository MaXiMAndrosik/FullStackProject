<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Tariff;
use App\Models\Meter;
use App\Models\MeterType;
use App\Services\TariffService;
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

    public function __construct(TariffService $tariffService)
    {
        $this->tariffService = $tariffService;
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
                'is_active' => 'sometimes|boolean'
            ], [
                'code.required' => 'Код услуги обязателен для заполнения.',
                'code.unique' => 'Услуга с таким кодом уже существует.',
                'name.required' => 'Название услуги обязательно для заполнения.',
                'calculation_type.required' => 'Тип расчета обязателен для выбора.',
                'meter_type_ids.required_if' => 'Для услуг по счетчикам необходимо выбрать типы счетчиков.',
                'meter_type_ids.*.exists' => 'Выбран несуществующий тип счетчика.'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка валидации данных при создании услуги.',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
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
                    'rate' => 0.0000,
                    'unit' => $unit,
                    'start_date' => Carbon::today(),
                    'end_date' => null,
                ]);

                return $service;
            });

            $service->load(['meterTypes', 'tariffs']);

            Log::info('Service created successfully', [
                'service_id' => $service->id,
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
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка валидации данных при обновлении услуги.',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $validated = $validator->validated();

            DB::transaction(function () use ($service, $validated) {
                $originalCalculationType = $service->calculation_type;
                $originalIsActive = $service->is_active;
                $oldMeterTypeIds = $service->meterTypes->pluck('id')->toArray();

                $service->update($validated);

                if (isset($validated['meter_type_ids'])) {
                    $service->meterTypes()->sync(
                        $service->calculation_type === 'meter'
                            ? $validated['meter_type_ids']
                            : []
                    );
                }

                $newMeterTypeIds = $service->meterTypes->pluck('id')->toArray();

                $this->updateMetersActivation(
                    $originalIsActive,
                    $service->is_active,
                    $oldMeterTypeIds,
                    $newMeterTypeIds
                );

                if (
                    isset($validated['calculation_type']) &&
                    $validated['calculation_type'] !== $originalCalculationType
                ) {

                    $this->handleCalculationTypeChange($service, $validated);
                }
            });

            $service->load(['meterTypes', 'tariffs']);

            Log::info('Service updated successfully', [
                'service_id' => $service->id,
                'code' => $service->code
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
            // Проверяем, есть ли связанные данные которые могут блокировать удаление
            $tariffsCount = $service->tariffs()->count();
            $hasActiveTariffs = $service->tariffs()->whereNull('end_date')->exists();

            if ($hasActiveTariffs) {
                return response()->json([
                    'success' => false,
                    'message' => 'Невозможно удалить услугу с активными тарифами. Сначала закройте все активные тарифы.'
                ], Response::HTTP_BAD_REQUEST);
            }

            DB::transaction(function () use ($service) {
                $service->tariffs()->delete();
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
        return new ServiceResource($service);
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

    protected function handleCalculationTypeChange($service, $validated)
    {
        $activeTariff = $this->tariffService->getActiveTariff($service->id);
        if ($activeTariff) {
            // Закрываем старый тариф вчерашним днем
            $activeTariff->update(['end_date' => Carbon::yesterday()]);

            // Создаем новый тариф с rate=0.0000
            $newUnit = $this->getUnitForService(
                $validated['calculation_type'],
                $validated['meter_type_ids'] ?? []
            );

            Tariff::create([
                'service_id' => $service->id,
                'rate' => 0.0000, // Требование 3: rate=0.0000
                'unit' => $newUnit,
                'start_date' => Carbon::today(), // Начинается сегодня
                'end_date' => null
            ]);

            Log::info('Service calculation type changed - new tariff created', [
                'service_id' => $service->id,
                'old_calculation_type' => $service->calculation_type,
                'new_calculation_type' => $validated['calculation_type'],
                'new_unit' => $newUnit,
                'rate' => 0.0000
            ]);
        }
    }
}
