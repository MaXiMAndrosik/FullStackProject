<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AssignmentTariff;
use App\Models\ServiceAssignment;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class AssignmentTariffController extends Controller
{
    public function store(Request $request, ServiceAssignment $assignment_tariff)
    {
        $validated = $request->validate([
            'rate' => 'required|numeric',
            'unit' => 'required|in:m2,gcal,m3,kwh,fixed',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        $tariff = $assignment_tariff->customTariff()->create($validated);

        return response()->noContent(201);
    }

    public function update(Request $request, AssignmentTariff $assignment_tariff)
    {

        Log::debug('AssignmentTariffController update', [
            'Request' => $request->all(),
            'AssignmentTariff' => $assignment_tariff
        ]);

        // Проверяем, что услуга существует
        $serviceExists = ServiceAssignment::where('id', $assignment_tariff->assignment_id)->exists();
        if (!$serviceExists) {
            return response()->json(
                ['message' => 'Услуга не существует'],
                Response::HTTP_BAD_REQUEST
            );
        }

        Log::debug('AssignmentTariffController update', ['Request' => $request->all()]);

        // Валидация входных данных
        $validated = $request->validate([
            'rate' => 'required|numeric|min:0',
            'start_date' => 'required|date'
        ]);

        Log::debug('AssignmentTariffController update', ['validated' => $validated]);

        // Дата начала нового тарифа
        $newStartDate = Carbon::parse($validated['start_date']);

        // Для старого тарифа: end_date = за день до начала нового тарифа
        $endDateForOld = $newStartDate->copy()->subDay();

        // Создаем новый тариф
        $newTariff = AssignmentTariff::create([
            'assignment_id' => $assignment_tariff->assignment_id,
            'rate' => $validated['rate'],
            'unit' => $assignment_tariff->unit,
            'start_date' => $newStartDate,
            'end_date' => null
        ]);

        // Обновляем старый тариф
        $assignment_tariff->update(['end_date' => $endDateForOld]);

        Log::info('AssignmentTariffController update', ['newTariff' => $newTariff]);

        return response()->noContent(201);
    }

    public function destroy(AssignmentTariff $assignment_tariff)
    {
        Log::debug('AssignmentTariffController destroy', ['Tariff' => $assignment_tariff]);

        // Проверяем, можно ли удалить тариф:
        $serviceAssignmentExists = ServiceAssignment::where('id', $assignment_tariff->assignment_id)->exists();

        Log::debug('AssignmentTariffController destroy', ['serviceExists' => $serviceAssignmentExists]);

        // Проверяем активен ли тариф
        $isActive = Carbon::parse($assignment_tariff->start_date)->lte(Carbon::today()) &&
            (!$assignment_tariff->end_date || Carbon::parse($assignment_tariff->end_date)->gte(Carbon::today()));

        Log::debug('AssignmentTariffController destroy', ['isActive' => $isActive]);

        if ($serviceAssignmentExists && $isActive) {
            return response()->json(
                ['message' => 'Нельзя удалить активный тариф'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $assignment_tariff->delete();

        Log::info('AssignmentTariffController destroy', ['Tariff' => $assignment_tariff]);

        return response()->noContent(204);
    }
}
