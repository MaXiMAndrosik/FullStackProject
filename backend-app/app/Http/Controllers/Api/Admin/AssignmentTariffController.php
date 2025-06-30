<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AssignmentTariff;
use App\Models\ServiceAssignment;
use Illuminate\Http\Request;

class AssignmentTariffController extends Controller
{
    public function store(Request $request, ServiceAssignment $assignment)
    {
        $validated = $request->validate([
            'rate' => 'required|numeric',
            'unit' => 'required|in:m2,gcal,m3,kwh,fixed',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        $tariff = $assignment->customTariff()->create($validated);

        return response()->noContent(201);
    }

    public function update(Request $request, AssignmentTariff $tariff)
    {
        $validated = $request->validate([
            'rate' => 'required|numeric',
            'unit' => 'required|in:m2,gcal,m3,kwh,fixed',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        $tariff->update($validated);
        return response()->noContent(201);
    }

    public function destroy(AssignmentTariff $tariff)
    {
        $tariff->delete();
        return response()->noContent(204);
    }
}
