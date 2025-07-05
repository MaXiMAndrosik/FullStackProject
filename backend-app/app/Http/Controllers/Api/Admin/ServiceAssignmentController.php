<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceAssignment;
use App\Models\AssignmentTariff;
use App\Models\Owner;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

class ServiceAssignmentController extends Controller
{
    public function index()
    {
        $assignments = ServiceAssignment::with('tariffs')->get();

        return $assignments->map(function ($assignment) {
            $data = $assignment->toArray();

            if ($assignment->scope === 'apartment' && $assignment->apartment) {
                $data['apartment_number'] = $assignment->apartment->number;
            }

            return $data;
        });

        // return ServiceAssignment::with('tariffs')->get();
    }

    public function store(Request $request)
    {

        // Валидация для создания новых назначений
        $validated = $request->validate([
            '*.scope' => 'required|in:apartment,entrance',
            '*.apartment_id' => 'nullable|required_if:*.scope,apartment|exists:apartments,id',
            '*.entrance' => 'nullable|required_if:*.scope,entrance|integer|min:1',
            '*.name' => 'required|string|max:100',
            '*.type' => ['required', Rule::in(['main', 'utility', 'additional', 'other'])],
            '*.calculation_type' => ['required', Rule::in(['fixed', 'meter', 'area'])],
            '*.unit' => 'nullable|string|in:m3,gcal,kwh',
            '*.is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated as $item) {
                $assignment = ServiceAssignment::create($item);
                Log::debug('ServiceAssignmentController store', [
                    'ServiceAssignment::create' => $assignment
                ]);

                $unit = $item['unit'] ?? $this->getDefaultUnit($item['calculation_type']);

                $tariff = AssignmentTariff::create([
                    'assignment_id' => $assignment->id,
                    'rate' => 0.0000,
                    'unit' => $unit,
                    'start_date' => Carbon::today(),
                    'end_date' => null
                ]);

                Log::debug('ServiceAssignmentController store', [
                    'AssignmentTariff::create' => $tariff
                ]);
            }
        });

        return response()->noContent(201);
    }

    public function update(Request $request, ServiceAssignment $service_assignment)
    {

        // Запрещаем изменение привязки и объекта
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'type' => ['required', Rule::in(['main', 'utility', 'additional', 'other'])],
            'calculation_type' => ['required', Rule::in(['fixed', 'meter', 'area'])],
            'unit' => 'nullable|string|in:m3,gcal,kwh',
            'is_active' => 'sometimes|boolean',
        ]);

        Log::debug('ServiceAssignmentController update', [
            'validated' => $validated
        ]);

        // Определяем новую единицу измерения
        $newUnit = $validated['unit'] ?? $this->getDefaultUnit($validated['calculation_type']);

        DB::transaction(function () use ($service_assignment, $validated, $newUnit) {
            // Сохраняем оригинальный тип расчета ДО обновления
            $originalCalculationType = $service_assignment->calculation_type;

            // Обновляем только разрешенные поля
            $service_assignment->update([
                'name' => $validated['name'],
                'type' => $validated['type'],
                'calculation_type' => $validated['calculation_type'],
                'is_active' => $validated['is_active'] ?? $service_assignment->is_active,
            ]);

            // Проверяем изменение типа расчета
            if ($validated['calculation_type'] !== $originalCalculationType) {
                // Ищем активный тариф
                $activeTariff = $service_assignment->tariffs()
                    ->where(function ($query) {
                        $query->whereNull('end_date')
                            ->orWhere('end_date', '>', now());
                    })
                    ->latest('start_date')
                    ->first();

                if ($activeTariff) {
                    // Закрываем старый тариф
                    $activeTariff->update(['end_date' => Carbon::yesterday()]);

                    // Создаем новый тариф с обновленной единицей
                    $service_assignment->tariffs()->create([
                        'rate' => $activeTariff->rate,
                        'unit' => $newUnit,
                        'start_date' => Carbon::today(),
                        'end_date' => null
                    ]);
                }
            }
        });

        return response()->noContent(204);
    }

    public function destroy(ServiceAssignment $service_assignment)
    {
        Log::debug('ServiceAssignmentController destroy', ['ServiceAssignment' => $service_assignment]);
        // Удаляем все связанные тарифы
        $service_assignment->tariffs()->delete();

        // Удаляем саму услугу
        $service_assignment->delete();
        return response()->noContent(204);
    }

    /**
     * Переключение активности услуги
     */
    public function toggleActive(ServiceAssignment $service_assignment)
    {
        $service_assignment->update(['is_active' => !$service_assignment->is_active]);
        Log::debug('ServiceAssignmentController toggleActive', ['ServiceAssignment' => $service_assignment]);
        return response()->noContent(201);
    }

    public function show(Request $request)
    {
        $user = $request->user();

        if ($user->role != "owner") {
            return response()->json([
                'success' => false,
                'message' => 'Доступ запрещен. Только для собственников.'
            ], 403);
        }

        // Получаем данные за 2 запроса:
        // 1. Получаем владельцев с квартирами
        $ownersWithApartments = Owner::where('user_id', $user->id)
            ->with(['apartment' => function ($query) {
                $query->select('id', 'number', 'entrance');
            }])
            ->get();

        // Если нет квартир, возвращаем пустой список
        if ($ownersWithApartments->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        // Собираем данные для запроса услуг
        $apartmentIds = [];
        $entrances = [];

        foreach ($ownersWithApartments as $owner) {
            if ($owner->apartment) {
                $apartmentIds[] = $owner->apartment->id;
                $entrances[] = $owner->apartment->entrance;
            }
        }

        // Убираем дубликаты
        $apartmentIds = array_unique($apartmentIds);
        $entrances = array_unique($entrances);

        Log::debug('ServiceAssignmentController show', [
            'apartmentIds' => $apartmentIds,
            'entrances' => $entrances
        ]);

        // 2. Получаем услуги с тарифами
        $services = ServiceAssignment::where('is_active', true)
            ->where(function ($query) use ($apartmentIds, $entrances) {
                $query->where(function ($q) use ($apartmentIds) {
                    $q->where('scope', 'apartment')
                        ->whereIn('apartment_id', $apartmentIds);
                })
                    ->orWhere(function ($q) use ($entrances) {
                        $q->where('scope', 'entrance')
                            ->whereIn('entrance', $entrances);
                    });
            })
            ->with([
                'apartment:id,number,entrance',
                'tariffs' => function ($query) {
                    $query->active()
                        ->latest('start_date')
                        ->take(1);
                }
            ])
            ->get();

        // Форматируем ответ
        $formattedServices = $services->map(function ($assignment) {
            $currentTariff = $assignment->tariffs->first();

            return [
                'id' => $assignment->id,
                'name' => $assignment->name,
                'type' => $assignment->type,
                'current_tariff' => $currentTariff ? [
                    'rate' => $currentTariff->rate,
                    'unit' => $currentTariff->unit,
                    'start_date' => $currentTariff->start_date,
                ] : null,
            ];
        });

        Log::info('ServiceAssignmentController show', ['ServiceAssignment' => $services]);

        return response()->json([
            'success' => true,
            'data' => $formattedServices
        ]);
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
