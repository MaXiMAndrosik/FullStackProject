<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Tariff;
use App\Models\Meter;
use App\Models\MeterType;
use App\Http\Resources\ServiceResource;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ServiceController extends Controller
{
    /**
     * Получить все услуги и тарифы к ним
     */
    public function index()
    {
        $services = Service::with(['meterTypes', 'tariffs'])->get();
        return ServiceResource::collection($services);
    }

    /**
     * Создать новую услугу
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:30', 'unique:services'],
            'name' => 'required|string|max:100',
            'type' => 'required|string|max:20',
            'description' => 'nullable|string',
            'calculation_type' => ['required', Rule::in(['fixed', 'meter', 'area'])],
            'meter_type_ids' => 'required_if:calculation_type,meter|array',
            'meter_type_ids.*' => 'exists:meter_types,id',
            'is_active' => 'sometimes|boolean'
        ]);

        // Используем возврат из транзакции вместо передачи по ссылке
        $service = DB::transaction(function () use ($validated) {
            $service = Service::create($validated);

            // Привязываем типы счетчиков для услуг по счетчику
            if ($service->calculation_type === 'meter' && isset($validated['meter_type_ids'])) {
                $service->meterTypes()->sync($validated['meter_type_ids']);

                // Активируем счетчики, если услуга активна
                if ($service->is_active) {
                    Meter::whereIn('type_id', $validated['meter_type_ids'])
                        ->update(['is_active' => true]);
                }
            }

            // Определяем правильный unit в зависимости от типа расчета
            $unit = $this->getUnitForService($service->calculation_type, $validated['meter_type_ids'] ?? []);

            // Создаем начальный тариф
            Tariff::create([
                'service_id' => $service->id,
                'rate' => 0.00,
                'unit' => $unit,
                'start_date' => Carbon::today(),
                'end_date' => null,
            ]);

            return $service;
        });

        // Загружаем отношения для возврата
        $service->load(['meterTypes', 'tariffs']);

        Log::debug('ServiceController store created', ['Service' => $service]);

        return new ServiceResource($service);
    }

    /**
     * Обновить услугу
     */
    public function update(Request $request, Service $service)
    {

        $originalData = $service->toArray();

        $validated = $request->validate([
            'code' => ['sometimes', 'string', 'max:30', Rule::unique('services')->ignore($service->id)],
            'name' => 'sometimes|string|max:100',
            'type' => 'required|string|max:20',
            'description' => 'nullable|string',
            'calculation_type' => ['sometimes', Rule::in(['fixed', 'meter', 'area'])],
            'meter_type_ids' => 'sometimes|array',
            'meter_type_ids.*' => 'exists:meter_types,id',
            'is_active' => 'sometimes|boolean'
        ]);

        DB::transaction(function () use ($service, $validated, $originalData) {
            $shouldCreateNewTariff = false;
            $newUnit = null;

            // Проверяем, изменился ли calculation_type
            if (isset($validated['calculation_type']) && $validated['calculation_type'] !== $originalData['calculation_type']) {
                $shouldCreateNewTariff = true;

                // Определяем unit на основе нового типа расчета и привязанных счетчиков
                $meterTypeIds = $validated['meter_type_ids'] ?? $service->meterTypes->pluck('id')->toArray();
                $newUnit = $this->getUnitForService($validated['calculation_type'], $meterTypeIds);
            }

            // Сохраняем старое значение is_active для проверки
            $oldIsActive = $service->is_active;

            // Сохраняем старые привязки счетчиков
            $oldMeterTypeIds = $service->meterTypes->pluck('id')->toArray();

            // Обновляем услугу
            $service->update($validated);

            // Обновляем привязки типов счетчиков (только для услуг по счетчику)
            if (isset($validated['meter_type_ids']) && $service->calculation_type === 'meter') {
                $service->meterTypes()->sync($validated['meter_type_ids']);
                $newMeterTypeIds = $validated['meter_type_ids'];
            } else {
                $service->meterTypes()->sync([]);
                $newMeterTypeIds = [];
            }

            // Логика активации/деактивации счетчиков
            if ($oldIsActive && !$service->is_active) {
                // Деактивируем все счетчики, связанные с услугами
                $meterTypeIds = array_unique(array_merge($oldMeterTypeIds, $newMeterTypeIds));
                if (!empty($meterTypeIds)) {
                    Meter::whereIn('type_id', $meterTypeIds)->update(['is_active' => false]);
                }
            } elseif (!$oldIsActive && $service->is_active) {
                // Активируем счетчики только новых привязанных типов
                if (!empty($newMeterTypeIds)) {
                    Meter::whereIn('type_id', $newMeterTypeIds)->update(['is_active' => true]);
                }
            }
            // Если услуга активна и изменились привязки счетчиков
            elseif ($service->is_active && $oldMeterTypeIds != $newMeterTypeIds) {
                // Деактивируем счетчики старых типов, которых больше нет в привязках
                $typesToDeactivate = array_diff($oldMeterTypeIds, $newMeterTypeIds);
                if (!empty($typesToDeactivate)) {
                    Meter::whereIn('type_id', $typesToDeactivate)->update(['is_active' => false]);
                }

                // Активируем счетчики новых типов
                if (!empty($newMeterTypeIds)) {
                    Meter::whereIn('type_id', $newMeterTypeIds)->update(['is_active' => true]);
                }
            }

            // Логика создания нового тарифа
            if ($shouldCreateNewTariff) {
                $activeTariff = Tariff::where('service_id', $service->id)
                    ->where(function ($query) {
                        $query->whereNull('end_date')
                            ->orWhere('end_date', '>', now());
                    })
                    ->latest('start_date')
                    ->first();

                if ($activeTariff) {
                    $activeTariff->update(['end_date' => Carbon::yesterday()]);

                    Tariff::create([
                        'service_id' => $service->id,
                        'rate' => $activeTariff->rate,
                        'start_date' => Carbon::today(),
                        'end_date' => null,
                        'unit' => $newUnit
                    ]);
                }
            }
        });

        // Загружаем обновленные отношения
        $service->load(['meterTypes', 'tariffs']);

        return new ServiceResource($service);
    }

    /**
     * Удалить услугу
     */
    public function destroy(Service $service)
    {
        Log::debug('ServiceController destroy', ['Service' => $service]);

        DB::transaction(function () use ($service) {
            // Удаляем все связанные тарифы
            $service->tariffs()->delete();

            // Удаляем связи с типами счетчиков
            $service->meterTypes()->detach();

            // Удаляем саму услугу
            $service->delete();
        });

        return response()->noContent(204);
    }

    /**
     * Переключение активности услуги
     */
    public function toggleActive(Service $service)
    {
        $newStatus = !$service->is_active;

        DB::transaction(function () use ($service, $newStatus) {
            $service->update(['is_active' => $newStatus]);

            // Обновляем статус связанных счетчиков
            if ($service->calculation_type === 'meter') {
                $meterTypeIds = $service->meterTypes->pluck('id')->toArray();
                if (!empty($meterTypeIds)) {
                    Meter::whereIn('type_id', $meterTypeIds)->update(['is_active' => $newStatus]);
                }
            }
        });

        // Загружаем обновленные отношения
        $service->load(['meterTypes', 'tariffs']);

        return new ServiceResource($service);
    }

    /**
     * Получить активные услуги (публичный метод)
     */
    public function show(Request $request)
    {
        try {
            // Получаем все активные услуги с их текущими тарифами
            $services = Service::where('is_active', true)
                ->with(['tariffs' => function ($query) {
                    $query->where(function ($q) {
                        $q->whereNull('end_date')
                            ->orWhere('end_date', '>', now());
                    });
                }, 'meterTypes'])
                ->get();

            // Используем Resource для форматирования
            $formattedServices = ServiceResource::collection($services);

            Log::debug('ServiceController show', ['services' => $formattedServices]);

            return response()->json([
                'success' => true,
                'data' => $formattedServices
            ]);
        } catch (\Exception $e) {
            Log::error('ServiceController show error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении услуг',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Получить unit для услуги на основе типа расчета и привязанных счетчиков
     */
    protected function getUnitForService($calculationType, array $meterTypeIds = []): string
    {
        // Для услуг по счетчику берем unit из первого привязанного счетчика
        if ($calculationType === 'meter' && !empty($meterTypeIds)) {
            $firstMeterType = MeterType::find($meterTypeIds[0]);
            if ($firstMeterType && $firstMeterType->unit) {
                return $firstMeterType->unit;
            }
        }

        // Для остальных случаев используем стандартные значения
        return match ($calculationType) {
            'fixed' => 'fixed',
            'meter' => 'm3', // Резервное значение, если счетчики не найдены
            'area' => 'm2',
            default => 'fixed',
        };
    }
}
