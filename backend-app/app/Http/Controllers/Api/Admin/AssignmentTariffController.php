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
    public function store(Request $request, ServiceAssignment $service_assignment)
    {
        $validated = $request->validate([
            'rate' => 'required|numeric',
            'unit' => 'required|in:m2,gcal,m3,kwh,fixed',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        // Создаем тариф через отношение
        $service_assignment->tariff()->create($validated);

        return response()->noContent(201);
    }

    public function update(Request $request, AssignmentTariff $assignment_tariff)
    {

        // Проверяем, что услуга существует
        $serviceExists = ServiceAssignment::where('id', $assignment_tariff->assignment_id)->exists();
        if (!$serviceExists) {
            return response()->json(
                ['message' => 'Услуга не существует'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Запрещаем редактирование устаревших тарифов
        if ($this->isTariffExpired($assignment_tariff)) {
            return response()->json(
                ['message' => 'Нельзя редактировать устаревший тариф'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Проверяем, активна ли родительская услуга
        $serviceAssignment = ServiceAssignment::find($assignment_tariff->assignment_id);
        if (!$serviceAssignment || !$serviceAssignment->is_active) {
            return response()->json(
                ['message' => 'Нельзя редактировать тариф неактивной услуги'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Валидация входных данных
        $validated = $request->validate([
            'rate' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date'
        ]);

        // Обновляем текущий тариф
        $assignment_tariff->update($validated);

        // Загружаем обновленные данные услуги с отношениями
        $serviceAssignment->load('tariff', 'apartment');

        $formattedAssignment = $this->formatAssignment($serviceAssignment);

        Log::info('AssignmentTariffController update', ['tariff' => $assignment_tariff]);

        return response()->json([
            'success' => true,
            'message' => 'Тариф успешно обновлен',
            'data' => $formattedAssignment
        ], 200);
    }



    public function destroy(AssignmentTariff $assignment_tariff)
    {
        // Запрещаем удаление тарифов для сохранения истории
        return response()->json(
            ['message' => 'Удаление тарифов запрещено'],
            Response::HTTP_METHOD_NOT_ALLOWED
        );
    }

    /**
     * Проверяет, устарел ли тариф
     */
    private function isTariffExpired(AssignmentTariff $tariff): bool
    {
        $today = Carbon::today();

        // Если есть дата окончания и она в прошлом - тариф устарел
        if ($tariff->end_date && Carbon::parse($tariff->end_date)->lt($today)) {
            return true;
        }

        return false;
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
