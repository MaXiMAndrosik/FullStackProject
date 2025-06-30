<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tariff;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class TariffController extends Controller
{
    public function index()
    {
        return Tariff::all();
    }

    public function update(Request $request, Tariff $tariff)
    {

        // Проверяем, что услуга существует
        $serviceExists = Service::where('id', $tariff->service_id)->exists();
        if (!$serviceExists) {
            return response()->json(
                ['message' => 'Услуга не существует'],
                Response::HTTP_BAD_REQUEST
            );
        }

        Log::debug('TariffController update', ['Request' => $request]);

        // Валидация входных данных
        $validated = $request->validate([
            'rate' => 'required|numeric|min:0',
            'start_date' => 'required|date'
        ]);

        Log::debug('TariffController update', ['validated' => $validated]);

        // Дата начала нового тарифа
        $newStartDate = Carbon::parse($validated['start_date']);

        // Для старого тарифа: end_date = за день до начала нового тарифа
        $endDateForOld = $newStartDate->copy()->subDay();

        // Создаем новый тариф
        $newTariff = Tariff::create([
            'service_id' => $tariff->service_id,
            'rate' => $validated['rate'],
            'unit' => $tariff->unit,
            'start_date' => $newStartDate,
            'end_date' => null
        ]);

        // Обновляем старый тариф
        $tariff->update(['end_date' => $endDateForOld]);

        Log::info('TariffController update', ['newTariff' => $newTariff]);

        return response()->noContent(201);
    }

    public function destroy(Tariff $tariff)
    {
        Log::debug('TariffController destroy', ['Tariff' => $tariff]);

        // Проверяем, можно ли удалить тариф:
        // 1. Если услуга не существует - можно удалить
        // 2. Если тариф устарел (end_date < сегодня) - можно удалить
        // 3. Если тариф не текущий (start_date > сегодня) - можно удалить


        // Проверяем, можно ли удалить тариф:
        $serviceExists = Service::where('id', $tariff->service_id)->exists();

        // Проверяем активен ли тариф
        $isActive = Carbon::parse($tariff->start_date)->lte(Carbon::today()) &&
            (!$tariff->end_date || Carbon::parse($tariff->end_date)->gte(Carbon::today()));

        if ($serviceExists && $isActive) {
            return response()->json(
                ['message' => 'Нельзя удалить активный тариф'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $tariff->delete();

        return response()->noContent(201);
    }
}
