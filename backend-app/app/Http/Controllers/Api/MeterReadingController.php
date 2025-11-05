<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Meter;
use App\Models\MeterReading;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MeterReadingController extends Controller
{
    /**
     * Получить показания счетчиков для администратора
     */
    public function index(Request $request)
    {
        $request->validate([
            'type_id' => 'nullable|exists:meter_types,id',
            'apartment_id' => 'nullable|exists:apartments,id'
        ]);

        $currentMonth = Carbon::now()->startOfMonth();

        // Получаем 4 месяца: от текущего месяца -4 до текущего месяца -1
        $periods = [];
        for ($i = 4; $i >= 1; $i--) {
            $periods[] = $currentMonth->copy()->subMonths($i);
        }

        // Получаем активные счетчики с фильтрацией
        $meters = Meter::with(['type', 'apartment'])
            ->when($request->type_id, function ($query) use ($request) {
                $query->where('type_id', $request->type_id);
            })
            ->when($request->apartment_id, function ($query) use ($request) {
                $query->where('apartment_id', $request->apartment_id);
            })
            ->where('is_active', true)
            ->get();

        $result = [];

        foreach ($meters as $meter) {
            $meterReadings = [];
            foreach ($periods as $period) {
                $reading = MeterReading::where('meter_id', $meter->id)
                    ->whereYear('period', $period->year)
                    ->whereMonth('period', $period->month)
                    ->first();

                $meterReadings[$period->format('Y-m')] = [
                    'id' => $reading?->id,
                    'value' => $reading?->value,
                    'is_fixed' => $reading?->is_fixed ?? false,
                    'period' => $period->format('Y-m-d'),
                ];
            }

            $result[] = [
                'meter' => $meter,
                'readings' => $meterReadings
            ];
        }

        return response()->json([
            'data' => $result,
            'periods' => array_map(function ($period) {
                return $period->format('Y-m');
            }, $periods)
        ]);
    }

    /**
     * Массовое сохранение показаний счетчиков
     */
    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'readings' => 'required|array',
            'readings.*.meter_id' => 'required|exists:meters,id',
            'readings.*.period' => 'required|date|date_format:Y-m-d',
            'readings.*.value' => 'required|integer|min:0',
        ]);

        DB::beginTransaction();

        try {
            $savedReadings = [];
            $errors = [];

            foreach ($validated['readings'] as $index => $readingData) {
                try {
                    $existingReading = MeterReading::where('meter_id', $readingData['meter_id'])
                        ->where('period', $readingData['period'])
                        ->first();

                    // ПРОВЕРКА: если данные зафиксированы, запрещаем изменение
                    if ($existingReading && $existingReading->is_fixed) {
                        $errors[] = [
                            'index' => $index,
                            'meter_id' => $readingData['meter_id'],
                            'error' => 'Данные зафиксированы и не могут быть изменены'
                        ];
                        continue;
                    }

                    if ($existingReading) {
                        // Обновляем существующую запись НЕ меняя is_fixed
                        $existingReading->update([
                            'value' => $readingData['value'],
                            // НЕ меняем is_fixed - оставляем текущее значение
                            // is_fixed должен меняться только через специальные методы
                        ]);
                        $savedReadings[] = $existingReading;
                    } else {
                        // Создаем новую запись - по умолчанию не зафиксирована
                        $reading = MeterReading::create([
                            'meter_id' => $readingData['meter_id'],
                            'period' => $readingData['period'],
                            'value' => $readingData['value'],
                            'is_fixed' => false // новые записи по умолчанию не зафиксированы
                        ]);
                        $savedReadings[] = $reading;
                    }
                } catch (\Exception $e) {
                    $errors[] = [
                        'index' => $index,
                        'meter_id' => $readingData['meter_id'],
                        'error' => $e->getMessage()
                    ];
                }
            }

            if (!empty($errors)) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Часть показаний не удалось сохранить',
                    'saved_count' => 0,
                    'errors' => $errors
                ], 422);
            }

            DB::commit();

            return response()->json([
                'message' => 'Показания успешно сохранены',
                'saved_count' => count($savedReadings),
                'data' => $savedReadings
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('MeterReadingController bulkStore error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Ошибка при массовом сохранении показаний: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить показания для собственника
     */
    public function forOwner(Request $request)
    {
        $user = $request->user();

        if (!$user->owner) {
            return response()->json(['message' => 'Собственник не найден'], 404);
        }

        $apartment = $user->owner->apartment;
        $currentMonth = Carbon::now()->startOfMonth();

        // Получаем активные счетчики квартиры собственника
        $meters = Meter::with(['type'])
            ->where('apartment_id', $apartment->id)
            ->where('is_active', true)
            ->get();

        $result = [];

        foreach ($meters as $meter) {
            // Получаем показания за последние 2 месяца и текущий
            $periods = [];
            for ($i = 2; $i >= 0; $i--) {
                $periods[] = $currentMonth->copy()->subMonths($i);
            }

            $meterReadings = [];
            foreach ($periods as $period) {
                $reading = MeterReading::where('meter_id', $meter->id)
                    ->whereYear('period', $period->year)
                    ->whereMonth('period', $period->month)
                    ->first();

                $meterReadings[$period->format('Y-m')] = [
                    'id' => $reading?->id,
                    'value' => $reading?->value,
                    'is_fixed' => $reading?->is_fixed ?? false,
                    'period' => $period->format('Y-m'),
                    'updated_at' => $reading?->updated_at->format('Y-m-d')
                ];
            }

            $result[] = [
                'meter' => $meter,
                'readings' => $meterReadings
            ];
        }

        return response()->json([
            'data' => $result,
            'current_month' => $currentMonth->format('F Y')
        ]);
    }

    /**
     * Создать показание счетчика
     */
    public function store(Request $request)
    {
        Log::debug('MeterReadingController store', ['Request' => $request->all()]);

        $validated = $request->validate([
            'meter_id' => 'required|exists:meters,id',
            'period' => 'required|date|date_format:Y-m-d',
            'value' => 'required|numeric|min:0',
            'is_fixed' => 'sometimes|boolean'
        ]);

        // Создаем новое показание
        $reading = MeterReading::create($validated);
        $message = 'Показание успешно создано';

        return response()->json([
            'message' => $message,
            'data' => $reading->load('meter')
        ], 201);
    }

    /**
     * Обновить показание счетчика
     */
    public function update(Request $request, MeterReading $meterReading)
    {
        Log::debug('MeterReadingController update', ['Request' => $request->all()]);

        $validated = $request->validate([
            'value' => 'required|numeric|min:0',
            'is_fixed' => 'sometimes|boolean'
        ]);

        $meterReading->update([
            'value' => $validated['value'],
            'is_fixed' => $validated['is_fixed'] ?? $meterReading->is_fixed
        ]);

        return response()->json([
            'message' => 'Показание успешно обновлено',
            'data' => $meterReading->load('meter')
        ]);
    }

    /**
     * Удалить показание счетчика
     */
    public function destroy(MeterReading $meterReading)
    {
        $meterReading->delete();

        return response()->json([
            'message' => 'Показание успешно удалено'
        ]);
    }

    /**
     * Получить историю показаний конкретного счетчика
     */
    public function byMeter(Meter $meter)
    {
        $readings = MeterReading::where('meter_id', $meter->id)
            ->orderBy('period', 'desc')
            ->get();

        return response()->json([
            'data' => $readings,
            'meter' => $meter->load(['type', 'apartment.building'])
        ]);
    }

    /**
     * Зафиксировать показания за период (после формирования квитанций)
     */
    public function fixReadings(Request $request)
    {
        $validated = $request->validate([
            'period' => 'required|date|date_format:Y-m-d',
        ]);

        try {
            $period = Carbon::parse($validated['period'])->startOfMonth();

            $updatedCount = MeterReading::where('period', $period->format('Y-m-d'))
                ->update(['is_fixed' => true]);

            return response()->json([
                'message' => 'Показания за период ' . $period->format('Y-m') . ' зафиксированы',
                'fixed_count' => $updatedCount
            ]);
        } catch (\Exception $e) {
            Log::error('MeterReadingController fixReadings error', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Ошибка при фиксации показаний: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Разблокировать показания за период (только для админа)
     */
    public function unfixReadings(Request $request)
    {
        $validated = $request->validate([
            'period' => 'required|date|date_format:Y-m-d',
        ]);

        try {
            $period = Carbon::parse($validated['period'])->startOfMonth();

            $updatedCount = MeterReading::where('period', $period->format('Y-m-d'))
                ->update(['is_fixed' => false]);

            return response()->json([
                'message' => 'Показания за период ' . $period->format('Y-m') . ' разблокированы',
                'unfixed_count' => $updatedCount
            ]);
        } catch (\Exception $e) {
            Log::error('MeterReadingController unfixReadings error', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Ошибка при разблокировке показаний: ' . $e->getMessage()
            ], 500);
        }
    }
}
