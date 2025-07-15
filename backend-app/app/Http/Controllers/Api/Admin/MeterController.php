<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;;

use App\Models\Meter;
use App\Models\Apartment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class MeterController extends Controller
{
    public function index()
    {
        return Meter::with(['apartment', 'type'])
            ->orderBy('apartment_id')
            ->orderBy('type_id')
            ->get();
    }

    public function store(Request $request)
    {

        Log::debug('MeterController store', ['Request' => $request->all()]);

        $validated = $request->validate([
            'apartment_id' => 'required|exists:apartments,id',
            'type_id' => 'required|exists:meter_types,id',
            'serial_number' => 'required|string|unique:meters',
            'installation_date' => 'required|date',
            'next_verification_date' => 'nullable|date|after:installation_date',
            'is_active' => 'sometimes|boolean'
        ]);

        return Meter::create($validated);
    }

    public function show(Meter $meter)
    {
        return $meter->load(['apartment', 'type']);
    }

    public function update(Request $request, Meter $meter)
    {

        Log::debug('MeterController update', ['Request' => $request->all()]);

        $validated = $request->validate([
            'apartment_id' => 'sometimes|exists:apartments,id',
            'type_id' => 'sometimes|exists:meter_types,id',
            'serial_number' => [
                'sometimes',
                'string',
                Rule::unique('meters')->ignore($meter->id)
            ],
            'installation_date' => 'sometimes|date',
            'next_verification_date' => 'nullable|date|after:installation_date',
            'is_active' => 'sometimes|boolean'
        ]);

        $meter->update($validated);
        return response()->noContent(201);
    }

    public function destroy(Meter $meter)
    {
        $meter->delete();
        return response()->noContent(204);
    }

    public function byApartment(Apartment $apartment)
    {
        return Meter::with('type')
            ->where('apartment_id', $apartment->id)
            ->get();
    }

    public function bulkToggle(Request $request)
    {

        Log::debug('MeterController bulkToggle', ['Request' => $request->all()]);

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:meters,id',
            'is_active' => 'required|boolean'
        ]);

        try {
            Meter::whereIn('id', $request->ids)
                ->update(['is_active' => $request->is_active]);

            return response()->json([
                'message' => 'Статус счетчиков успешно обновлен'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка при обновлении счетчиков: ' . $e->getMessage()
            ], 500);
        }
    }

    public function bulkDelete(Request $request)
    {

        Log::debug('MeterController bulkDelete', ['Request' => $request->all()]);

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:meters,id'
        ]);

        try {
            $count = Meter::whereIn('id', $request->ids)->delete();

            return response()->json([
                'message' => "Удалено счетчиков: $count"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка при удалении счетчиков: ' . $e->getMessage()
            ], 500);
        }
    }

    public function toggleStatus(Meter $meter, Request $request)
    {

        $request->validate([
            'is_active' => 'required|boolean'
        ]);

        try {
            $meter->update(['is_active' => $request->is_active]);
            return response()->noContent(201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка при изменении статуса: ' . $e->getMessage()
            ], 500);
        }
    }
}
