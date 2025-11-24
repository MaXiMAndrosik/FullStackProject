<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceAssignment;
use App\Models\Owner;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Request;

class ServiceAssignmentController extends Controller
{
    public function index()
    {
        // Автоматически отключаем услуги с устаревшими тарифами
        $this->deactivateServicesWithExpiredTariffs();

        $assignments = ServiceAssignment::with('tariff')->get();

        return $assignments->map(function ($assignment) {
            return $this->formatAssignment($assignment);
        });
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
            '*.unit' => 'nullable|string|in:m3,gcal,kwh,m2,fixed',
            '*.is_active' => 'boolean',
        ]);

        $createdAssignments = []; // Собираем созданные записи

        DB::transaction(function () use ($validated, &$createdAssignments) {
            foreach ($validated as $item) {
                $assignment = ServiceAssignment::create($item);

                $unit = $item['unit'] ?? $this->getDefaultUnit($item['calculation_type']);

                // Создаем тариф через отношение
                $assignment->tariff()->create([
                    'rate' => 0.0000,
                    'unit' => $unit,
                    'start_date' => Carbon::today(),
                    'end_date' => null
                ]);

                // Загружаем связи для форматирования
                $assignment->load('tariff', 'apartment');
                $createdAssignments[] = $assignment;
            }
        });

        // Форматируем ТОЛЬКО созданные услуги
        $formattedAssignments = collect($createdAssignments)->map(function ($assignment) {
            return $this->formatAssignment($assignment);
        });

        Log::info('ServiceAssignmentController store', ['ServiceAssignment' => $formattedAssignments]);

        return response()->json([
            'success' => true,
            'message' => 'Услуги успешно созданы',
            'data' => $formattedAssignments // Только созданные услуги
        ], Response::HTTP_CREATED);
    }

    public function update(Request $request, ServiceAssignment $service_assignment)
    {
        // Запрещаем изменение привязки и объекта
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'type' => ['required', Rule::in(['main', 'utility', 'additional', 'other'])],
            'calculation_type' => ['required', Rule::in(['fixed', 'meter', 'area'])],
            'unit' => 'nullable|string|in:m3,gcal,kwh,m2,fixed',
            'is_active' => 'sometimes|boolean',
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

            // Если изменился тип расчета - обновляем unit тарифа
            if ($validated['calculation_type'] !== $originalCalculationType) {
                if ($service_assignment->tariff) {
                    $service_assignment->tariff->update(['unit' => $newUnit]);
                }
            }
        });

        // Загружаем обновленные данные с отношениями
        $service_assignment->load('tariff', 'apartment');
        $formattedAssignment = $this->formatAssignment($service_assignment);

        Log::info('ServiceAssignmentController update', ['ServiceAssignment' => $formattedAssignment]);

        return response()->json([
            'success' => true,
            'message' => 'Услуга успешно обновлена',
            'data' => $formattedAssignment
        ], Response::HTTP_OK);
    }

    public function destroy(ServiceAssignment $service_assignment)
    {
        // Удаляем связанный тариф
        if ($service_assignment->tariff) {
            $service_assignment->tariff->delete();
        }

        // Удаляем саму услугу
        $service_assignment->delete();

        Log::info('ServiceAssignmentController destroy', ['ServiceAssignment' => $service_assignment]);

        return response()->json([
            'success' => true,
            'message' => 'Услуга успешно удалена.'
        ], Response::HTTP_OK);
    }

    /**
     * Переключение активности услуги
     */
    public function toggleActive(ServiceAssignment $service_assignment)
    {
        // Перед переключением проверяем, есть ли активный тариф
        $hasActiveTariff = $service_assignment->hasActiveTariff();

        // Если пытаемся активировать услугу без активного тарифа - запрещаем
        if (!$service_assignment->is_active && !$hasActiveTariff) {
            return response()->json(
                ['message' => 'Нельзя активировать услугу без активного тарифа'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $service_assignment->update(['is_active' => !$service_assignment->is_active]);

        // Загружаем обновленные данные с отношениями
        $service_assignment->load('tariff', 'apartment');
        $formattedAssignment = $this->formatAssignment($service_assignment);

        Log::info('ServiceAssignmentController toggleActive', ['ServiceAssignment' => $service_assignment]);

        return response()->json([
            'success' => true,
            'message' => 'Статус услуги изменен',
            'data' => $formattedAssignment
        ], Response::HTTP_OK);
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
                'tariff'
            ])
            ->get();

        // Форматируем ответ
        $formattedServices = $services->map(function ($assignment) {
            return [
                'id' => $assignment->id,
                'name' => $assignment->name,
                'type' => $assignment->type,
                'current_tariff' => $assignment->tariff ? [
                    'rate' => $assignment->tariff->rate,
                    'unit' => $assignment->tariff->unit,
                    'start_date' => $assignment->tariff->start_date,
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

    /**
     * Автоматически отключает услуги, у которых тариф устарел
     */
    private function deactivateServicesWithExpiredTariffs(): void
    {
        $today = Carbon::today();

        // Находим активные услуги с устаревшими тарифами
        $servicesToDeactivate = ServiceAssignment::where('is_active', true)
            ->with('tariff')
            ->get()
            ->filter(function ($service) use ($today) {
                return $service->isTariffExpired();
            });

        foreach ($servicesToDeactivate as $service) {
            $service->update(['is_active' => false]);
            Log::info('Automatically deactivated service with expired tariff', [
                'service_id' => $service->id,
                'service_name' => $service->name
            ]);
        }

        if ($servicesToDeactivate->count() > 0) {
            Log::info('Deactivated services count: ' . $servicesToDeactivate->count());
        }
    }

    private function formatAssignment($assignment)
    {
        $data = $assignment->toArray();

        if ($assignment->scope === 'apartment' && $assignment->apartment) {
            $data['apartment_number'] = $assignment->apartment->number;
        }

        return $data;
    }
}
