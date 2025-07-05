<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Tariff;
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
        return Service::with('tariffs')->get();
    }

    /**
     * Создать новую услугу
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:30|unique:services',
            'name' => 'required|string|max:100',
            'type' => 'required|string|max:20',
            'description' => 'nullable|string',
            'calculation_type' => ['required', Rule::in(['fixed', 'meter', 'area'])],
            'is_active' => 'sometimes|boolean'
        ]);

        // Создаем услугу
        $service = Service::create($validated);

        Log::info('ServiceController store', ['Service::create' => $service]);

        // Определяем единицу измерения по типу расчета
        $unit = $this->getDefaultUnit($validated['calculation_type']);

        // Создаем начальный тариф для услуги
        $newTariff = Tariff::create([
            'service_id' => $service->id,
            'rate' => 0.0000, // Начальная ставка 0
            'start_date' => Carbon::now(), // Начинается сегодня
            'end_date' => null, // Бессрочно
            'unit' => $unit,
        ]);

        Log::info('ServiceController store', ['Tariff::create' => $newTariff]);

        return response()->noContent(201);
    }

    /**
     * Обновить услугу
     */
    public function update(Request $request, Service $service)
    {

        Log::debug('ServiceController update', ['Service' => $service]);

        $originalData = $service->toArray();

        $validated = $request->validate([
            'code' => ['sometimes', 'string', 'max:30', Rule::unique('services')->ignore($service->id)],
            'name' => 'sometimes|string|max:100',
            'type' => 'required|string|max:20',
            'description' => 'nullable|string',
            'calculation_type' => ['sometimes', Rule::in(['fixed', 'meter', 'area'])],
            'is_active' => 'sometimes|boolean'
        ]);

        $newUnit = $this->getDefaultUnit($validated['calculation_type'] ?? $service->calculation_type);

        DB::transaction(function () use ($service, $validated, $newUnit, $originalData) {
            $service->update($validated);

            if (($validated['calculation_type'] ?? null) !== $originalData['calculation_type']) {
                // Находим текущий активный тариф
                $activeTariff = Tariff::where('service_id', $service->id)
                    ->where(function ($query) {
                        $query->whereNull('end_date')
                            ->orWhere('end_date', '>', now());
                    })
                    ->latest('start_date')
                    ->first();

                if ($activeTariff) {
                    // Закрываем старый тариф вчерашним днем
                    $activeTariff->update(['end_date' => Carbon::yesterday()]);

                    // Создаем новый тариф с обновленной единицей, начиная с сегодняшнего дня
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

        return response()->noContent(201);
    }

    /**
     * Удалить услугу
     */
    public function destroy(Service $service)
    {
        Log::debug('ServiceController destroy', ['Service' => $service]);
        // Удаляем все связанные тарифы
        $service->tariffs()->delete();

        // Удаляем саму услугу
        $service->delete();

        return response()->noContent(204);
    }

    /**
     * Переключение активности услуги
     */
    public function toggleActive(Service $service)
    {
        $service->update(['is_active' => !$service->is_active]);
        return response()->noContent(201);
    }

    protected function getDefaultUnit($calculationType): string
    {
        return match ($calculationType) {
            'fixed' => 'fixed',
            'meter' => 'm3',
            'area' => 'm2',
            default => 'fixed',
        };
    }
}
