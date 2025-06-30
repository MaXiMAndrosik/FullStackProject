<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceAssignment;
use App\Models\AssignmentTariff;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;

class ServiceAssignmentController extends Controller
{
    public function index()
    {
        return ServiceAssignment::with('tariffs')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            '*.scope' => 'required|in:apartment,entrance',
            '*.apartment_id' => 'nullable|required_if:*.scope,apartment|exists:apartments,id',
            '*.entrance' => 'nullable|required_if:*.scope,entrance|integer',
            '*.name' => 'required|string|max:100',
            '*.type' => 'required|in:main,utility,additional,other',
            '*.calculation_type' => 'required|in:fixed,meter,area',
            '*.is_active' => 'boolean',
        ]);

        $created = [];
        DB::transaction(function () use ($validated, &$created) {
            foreach ($validated as $item) {
                $assignment = ServiceAssignment::create($item);
                $created[] = $assignment;
            }
        });

        return response()->json($created, 201);
    }

    public function update(Request $request, ServiceAssignment $service_assignment)
    {

        Log::debug('ServiceAssignmentController update', ['ServiceAssignment' => $service_assignment]);

        $originalData = $service_assignment->toArray();

        $validated = $request->validate([
            'scope' => ['required', Rule::in(['apartment', 'entrance'])],
            'apartment_id' => [
                'nullable',
                'required_if:scope,apartment',
                'exists:apartments,id'
            ],
            'entrance' => [
                'nullable',
                'required_if:scope,entrance',
                'integer',
                'min:1'
            ],
            'name' => 'required|string|max:100',
            'type' => ['required', Rule::in(['main', 'utility', 'additional', 'other'])],
            'calculation_type' => ['required', Rule::in(['fixed', 'meter', 'area'])],
            'is_active' => 'sometimes|boolean',
        ]);

        Log::debug('ServiceAssignmentController update', ['Validated' => $validated]);

        $newUnit = $this->getDefaultUnit($validated['calculation_type'] ?? $service_assignment->calculation_type);

        DB::transaction(function () use ($service_assignment, $validated, $newUnit, $originalData) {
            $service_assignment->update($validated);

            if (($validated['calculation_type'] ?? null) !== $originalData['calculation_type']) {
                // Находим текущий активный тариф
                $activeTariff = AssignmentTariff::where('service_id', $service_assignment->id)
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
                    AssignmentTariff::create([
                        'service_id' => $service_assignment->id,
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

    public function destroy(ServiceAssignment $service_assignment)
    {
        Log::debug('ServiceAssignmentController destroy', ['ServiceAssignment' => $service_assignment]);
        // Удаляем все связанные тарифы
        $service_assignment->tariffs()->delete();

        // Удаляем саму услугу
        $service_assignment->delete();
        return response()->noContent();
    }

    /**
     * Переключение активности услуги
     */
    public function toggleActive(ServiceAssignment $service_assignment)
    {
        $service_assignment->update(['is_active' => !$service_assignment->is_active]);
        Log::debug('ServiceAssignmentController toggleActive', ['ServiceAssignment' => $service_assignment]);
        return response()->json($service_assignment);
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
