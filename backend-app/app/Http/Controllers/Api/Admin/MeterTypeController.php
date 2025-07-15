<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MeterType;
use Illuminate\Http\Request;

class MeterTypeController extends Controller
{
    public function index()
    {
        return MeterType::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'unit' => 'required|string|max:20',
            'description' => 'nullable|string'
        ]);

        return MeterType::create($validated);
    }

    public function show(MeterType $meterType)
    {
        return $meterType;
    }

    public function update(Request $request, MeterType $meterType)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:50',
            'unit' => 'sometimes|string|max:20',
            'description' => 'nullable|string'
        ]);

        $meterType->update($validated);
        return $meterType;
    }

    public function destroy(MeterType $meterType)
    {
        if ($meterType->meters()->exists()) {
            return response()->json([
                'message' => 'Cannot delete: Meter type is in use'
            ], 422);
        }

        $meterType->delete();
        return response()->noContent();
    }
}
