<?php

namespace App\Http\Controllers\Api;

use App\Models\Owner;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\UpdateOwnerRequest;

class OwnerController extends Controller
{

    /**
     * Получение всех владельцев
     */
    public function index()
    {
        // Получаем всех владельцев
        $owners = Owner::all();

        // Для пагинации (рекомендуется)
        $owners = Owner::paginate(20);

        return response()->json($owners);
    }

    /**
     * Получение владельца по ID
     */
    public function getByUserId($user_id)
    {
        $owner = Owner::where('user_id', $user_id)->firstOrFail();

        if (!$owner) {
            return response()->json(['message' => 'Owner not found'], 404);
        }

        return response()->json($owner, 200);
    }

    /**
     * Получение профиля с данными о жилом помещении
     */
    public function profile(Request $request)
    {
        $owner = $request->user()->owner()->with('apartment')->firstOrFail();

        return response()->json($owner, 200);
    }

    /**
     * Создание записи владельца
     */
    public function store(Request $request)
    {
        $owner = Owner::create($request->validated());

        return response()->json([
            'message' => 'Данные владельца успешно сохранены',
            'owner' => $owner
        ], 201);
    }

    /**
     * Обновление данных владельца
     */
    public function update(Request $request, Owner $owner)
    {
        $owner->update($request->validated());

        return response()->json([
            'message' => 'Данные владельца обновлены',
            'owner' => $owner->fresh()
        ]);
    }

    /**
     * Получение владельцев квартиры
     */
    public function getApartmentOwners(string $apartmentNumber)
    {
        $owners = Owner::getCurrentOwners($apartmentNumber);

        return response()->json([
            'apartment_number' => $apartmentNumber,
            'owners' => $owners
        ]);
    }

    /**
     * Подтверждение владельца (верификация)
     */
    public function verify(Owner $owner)
    {
        $owner->update([
            'is_verified' => true,
            // 'verified_by' => auth()->id(),
            'verified_at' => now()
        ]);

        return response()->json(['message' => 'Владелец успешно верифицирован']);
    }
}
