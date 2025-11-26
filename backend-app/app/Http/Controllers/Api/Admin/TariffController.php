<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tariff;
use App\Models\Service;
use App\Services\TariffService;
use App\Http\Resources\TariffResource;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class TariffController extends Controller
{
    protected $tariffService;

    public function __construct(TariffService $tariffService)
    {
        $this->tariffService = $tariffService;
    }

    /**
     * Получить список тарифов для услуги
     */
    public function index(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'service_id' => 'required|exists:services,id'
            ], [
                'service_id.required' => 'ID услуги обязателен для получения тарифов.',
                'service_id.exists' => 'Указанная услуга не существует.'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка валидации запроса.',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $serviceId = $request->service_id;
            $tariffs = Tariff::where('service_id', $serviceId)
                ->orderBy('start_date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Тарифы услуги успешно загружены.',
                'data' => TariffResource::collection($tariffs)
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            Log::error('Tariff index error: ' . $e->getMessage(), [
                'service_id' => $request->service_id,
                'exception' => $e
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Произошла ошибка при загрузке тарифов.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Создать новый тариф
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'service_id' => 'required|exists:services,id',
                'rate' => 'required|numeric|min:0',
                'unit' => 'required|string|max:20',
                'start_date' => 'required|date',
                'end_date' => 'nullable|date|after:start_date'
            ], [
                'service_id.required' => 'ID услуги обязателен.',
                'service_id.exists' => 'Указанная услуга не существует.',
                'rate.required' => 'Ставка тарифа обязательна.',
                'rate.numeric' => 'Ставка должна быть числом.',
                'rate.min' => 'Ставка не может быть отрицательной.',
                'unit.required' => 'Единица измерения обязательна.',
                'start_date.required' => 'Дата начала обязательна.',
                'start_date.date' => 'Дата начала должна быть корректной датой.',
                'end_date.date' => 'Дата окончания должна быть корректной датой.',
                'end_date.after' => 'Дата окончания должна быть после даты начала.'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка валидации данных тарифа.',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $validated = $validator->validated();

            // Проверяем пересечение дат с существующими тарифами
            $dateErrors = $this->tariffService->validateNewTariffDates(
                $validated['service_id'],
                $validated['start_date'],
                $validated['end_date'] ?? null
            );

            if (!empty($dateErrors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Невозможно создать тариф из-за конфликта дат.',
                    'errors' => $dateErrors
                ], Response::HTTP_BAD_REQUEST);
            }

            $tariff = DB::transaction(function () use ($validated) {
                return Tariff::create($validated);
            });

            Log::info('Tariff created successfully', [
                'tariff_id' => $tariff->id,
                'service_id' => $tariff->service_id,
                'rate' => $tariff->rate,
                'start_date' => $tariff->start_date
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Тариф успешно создан.',
                'data' => new TariffResource($tariff)
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            Log::error('Tariff creation failed: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'exception' => $e
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Произошла ошибка при создании тарифа.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Показать конкретный тариф
     */
    public function show(Tariff $tariff)
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Данные тарифа успешно загружены.',
                'data' => new TariffResource($tariff)
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            Log::error('Tariff show error: ' . $e->getMessage(), [
                'tariff_id' => $tariff->id,
                'exception' => $e
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Произошла ошибка при загрузке данных тарифа.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Обновить тариф
     */
    public function update(Request $request, Tariff $tariff)
    {
        try {
            // Проверяем существование услуги
            $service = Service::find($tariff->service_id);
            if (!$service) {
                return response()->json([
                    'success' => false,
                    'message' => 'Услуга не найдена. Невозможно обновить тариф для несуществующей услуги.'
                ], Response::HTTP_BAD_REQUEST);
            }

            $validator = Validator::make($request->all(), [
                'rate' => 'required|numeric|min:0',
                'start_date' => 'required|date',
                'end_date' => 'nullable|date|after:start_date'
            ], [
                'rate.required' => 'Ставка тарифа обязательна.',
                'rate.numeric' => 'Ставка должна быть числом.',
                'rate.min' => 'Ставка не может быть отрицательной.',
                'start_date.required' => 'Дата начала обязательна.',
                'start_date.date' => 'Дата начала должна быть корректной датой.',
                'end_date.date' => 'Дата окончания должна быть корректной датой.',
                'end_date.after' => 'Дата окончания должна быть после даты начала.'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка валидации данных тарифа.',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $validated = $validator->validated();

            // Запрещаем редактирование устаревших тарифов
            if ($tariff->isExpired()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Нельзя редактировать архивный тариф. Тариф действовал с ' .
                        $tariff->start_date->format('d.m.Y') . ' по ' .
                        ($tariff->end_date ? $tariff->end_date->format('d.m.Y') : 'настоящее время') . '.'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Проверяем валидность изменений дат
            $dateErrors = $this->tariffService->validateDateChanges($tariff, $validated);
            if (!empty($dateErrors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Невозможно обновить тариф.',
                    'errors' => $dateErrors
                ], Response::HTTP_BAD_REQUEST);
            }

            DB::transaction(function () use ($tariff, $validated) {
                $originalEndDate = $tariff->end_date;
                $newEndDate = isset($validated['end_date']) ? Carbon::parse($validated['end_date']) : null;

                // Определяем тип изменения end_date
                $endDateChanged = false;
                $endDateWasSet = false;

                if ($newEndDate) {
                    if (!$originalEndDate) {
                        // Случай 1: установка end_date (ранее был null)
                        $endDateWasSet = true;
                        $endDateChanged = true;
                    } else {
                        // Случай 2: изменение end_date (ранее было установлено)
                        $endDateChanged = !$newEndDate->equalTo(Carbon::parse($originalEndDate));
                    }
                } else {
                    // Случай 3: сброс end_date (было значение, стало null)
                    if ($originalEndDate) {
                        $endDateChanged = true;
                    }
                }

                // Обработка изменений end_date согласно требованиям
                if ($endDateWasSet) {
                    // Установка end_date - создать новый тариф
                    $this->tariffService->createNextTariff($tariff, $newEndDate);
                } elseif ($endDateChanged && $newEndDate) {
                    // Изменение end_date - обновить следующий тариф
                    $this->tariffService->handleEndDateChange($tariff, $newEndDate);
                }

                // Обновляем текущий тариф
                $tariff->update($validated);

                Log::info('Tariff updated successfully', [
                    'tariff_id' => $tariff->id,
                    'service_id' => $tariff->service_id,
                    'rate' => $validated['rate'],
                    'start_date' => $validated['start_date'],
                    'end_date' => $newEndDate,
                    'end_date_was_set' => $endDateWasSet,
                    'end_date_changed' => $endDateChanged
                ]);
            });

            $service = Service::with('tariffs', 'meterTypes')->find($tariff->service_id);

            return response()->json([
                'success' => true,
                'message' => 'Тариф успешно обновлен.',
                'data' => $service
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            Log::error('Tariff update failed: ' . $e->getMessage(), [
                'tariff_id' => $tariff->id,
                'request_data' => $request->all(),
                'exception' => $e
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Произошла внутренняя ошибка при обновлении тарифа.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Удалить архивный тариф
     */
    public function destroy(Request $request, Tariff $tariff)
    {
        try {
            // Проверяем, можно ли удалить тариф (только архивные)
            if (!$this->tariffService->canDeleteTariff($tariff)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Можно удалять только архивные тарифы. Активные и будущие тарифы удалять запрещено.'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Проверяем, не является ли тариф единственным для услуги
            // $tariffCount = Tariff::where('service_id', $tariff->service_id)->count();
            // if ($tariffCount <= 1) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Нельзя удалить единственный тариф услуги.'
            //     ], Response::HTTP_BAD_REQUEST);
            // }

            $serviceId = $tariff->service_id;
            $tariff->delete();

            Log::info('Archived tariff deleted', [
                'tariff_id' => $tariff->id,
                'service_id' => $tariff->service_id,
                'start_date' => $tariff->start_date,
                'end_date' => $tariff->end_date
            ]);

            $service = Service::with('tariffs', 'meterTypes')->find($serviceId);

            return response()->json([
                'success' => true,
                'message' => 'Архивный тариф успешно удален.',
                'data' => $service
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            Log::error('Tariff deletion failed: ' . $e->getMessage(), [
                'tariff_id' => $tariff->id,
                'exception' => $e
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Произошла ошибка при удалении тарифа.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Получить архивные тарифы для услуги
     */
    // public function expired(Request $request)
    // {
    //     try {
    //         $validator = Validator::make($request->all(), [
    //             'service_id' => 'required|exists:services,id'
    //         ]);

    //         if ($validator->fails()) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Ошибка валидации.',
    //                 'errors' => $validator->errors()
    //             ], Response::HTTP_UNPROCESSABLE_ENTITY);
    //         }

    //         $serviceId = $request->service_id;
    //         $expiredTariffs = $this->tariffService->getExpiredTariffs($serviceId);

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Архивные тарифы загружены.',
    //             'data' => TariffResource::collection($expiredTariffs)
    //         ], Response::HTTP_OK);
    //     } catch (\Exception $e) {
    //         Log::error('Failed to fetch expired tariffs: ' . $e->getMessage());
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Ошибка при загрузке архивных тарифов.'
    //         ], Response::HTTP_INTERNAL_SERVER_ERROR);
    //     }
    // }

    /**
     * Получить архивные тарифы (от удаленных услуг)
     */
    public function oldTariffs(Request $request)
    {
        try {
            $oldTariffs = Tariff::whereNull('service_id')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Архивные тарифы загружены.',
                'data' => TariffResource::collection($oldTariffs)
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            Log::error('Failed to fetch old tariffs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при загрузке архивных тарифов.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
