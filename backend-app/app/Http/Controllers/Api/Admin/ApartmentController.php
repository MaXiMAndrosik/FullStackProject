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
        return Apartment::all();
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
        return response()->noContent();
    }
}
