<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Apartment;
use Illuminate\Http\Request;

class ApartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $apartments = Apartment::withCount('owners')->get();

        return response()->json(
            $apartments->map(function ($apartment) {
                return [
                    'id' => $apartment->id,
                    'number' => $apartment->number,
                    'area' => $apartment->area,
                    'floor' => $apartment->floor,
                    'entrance' => $apartment->entrance,
                    'rooms' => $apartment->rooms,
                    'has_owners' => $apartment->owners_count > 0, // Флаг наличия собственников
                ];
            })
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'number' => 'required|string|max:10|unique:apartments',
            'area' => 'required|numeric|min:0',
            'entrance' => 'nullable|integer',
            'floor' => 'required|integer',
            'rooms' => 'required|integer',
        ]);

        return Apartment::create($data);
    }

    /**
     * Display the specified resource.
     */
    public function show(Apartment $apartment)
    {
        return $apartment;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Apartment $apartment)
    {
        $data = $request->validate([
            'number' => 'sometimes|required|string|max:10|unique:apartments,number,' . $apartment->id,
            'area' => 'sometimes|required|numeric|min:0',
            'entrance' => 'nullable|integer',
            'floor' => 'sometimes|required|integer',
            'rooms' => 'sometimes|required|integer',
        ]);

        $apartment->update($data);
        return $apartment;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Apartment $apartment)
    {
        $apartment->delete();
        return response()->noContent(204);
    }

    public function getEntranceAreas()
    {
        $entrances = Apartment::select('entrance')
            ->distinct()
            ->orderBy('entrance')
            ->pluck('entrance');

        $areas = [];
        foreach ($entrances as $entrance) {
            $area = Apartment::where('entrance', $entrance)->sum('area');
            $areas[$entrance] = round($area, 2);
        }

        return response()->json($areas);
    }
}
