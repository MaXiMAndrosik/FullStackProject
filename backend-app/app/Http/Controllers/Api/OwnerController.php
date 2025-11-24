<?php

namespace App\Http\Controllers\Api;

use App\Models\Owner;
use App\Models\Apartment;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;


class OwnerController extends Controller
{

    /**
     * Получение всех владельцев
     */
    public function index()
    {

        $owners = Owner::with('apartment')
            ->join('apartments', 'owners.apartment_id', '=', 'apartments.id')
            ->orderByRaw('CAST(apartments.number AS UNSIGNED)')
            ->select('owners.*')
            ->get();

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

        $validated = $request->validate([
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'patronymic' => 'required|string|max:255',
            'birth_date' => 'nullable|date',
            'phone' => 'nullable|string|max:20',
            'telegram' => 'nullable|string|max:100',
            'apartment_number' => 'required|string|max:10',
            'ownership_start_date' => 'required|date',
            'ownership_end_date' => 'nullable|date|after:ownership_start_date',
            'is_verified' => 'required|boolean',
        ]);

        // Функция для преобразования даты
        $parseDate = function ($date) {
            if (preg_match('/^\d{2}\.\d{2}\.\d{4}$/', $date)) {
                return Carbon::createFromFormat('d.m.Y', $date)->format('Y-m-d');
            }
            return $date;
        };

        // Преобразование дат
        $dateFields = ['birth_date', 'ownership_start_date', 'ownership_end_date'];
        foreach ($dateFields as $field) {
            if (!empty($validated[$field])) {
                $validated[$field] = $parseDate($validated[$field]);
            }
        }

        // Преобразование номера квартиры в apartment_id
        if (isset($validated['apartment_number'])) {
            $apartment = Apartment::where('number', $validated['apartment_number'])->first();

            if (!$apartment) {
                return response()->json([
                    'message' => 'Квартира с таким номером не найдена'
                ], 404);
            }

            $validated['apartment_id'] = $apartment->id;
            unset($validated['apartment_number']);
        }


        DB::transaction(function () use ($validated) {

            // Автоматическое завершение предыдущего владения
            $previousOwner = Owner::where('apartment_id', $validated['apartment_id'])
                ->whereNull('ownership_end_date')
                ->first();

            if ($previousOwner) {
                $previousOwner->update([
                    'ownership_end_date' => $validated['ownership_start_date']
                ]);
            }

            $owner = Owner::create($validated);

            Log::info('OwnerController store', ['Owner create' => $owner]);
        });

        return response()->json([
            'message' => 'Данные владельца успешно сохранены',
        ], 201);
    }

    /**
     * Обновление данных владельца
     */
    public function update(Request $request, Owner $owner)
    {

        if (isset($owner['ownership_end_date'])) {
            return response()->json([
                'message' => 'Запрещено редактировать устаревшие данные'
            ], 400);
        }

        $validated = $request->validate([
            'user_id' => 'nullable|integer|exists:users,id',
            'last_name' => 'sometimes|string|max:255',
            'first_name' => 'sometimes|string|max:255',
            'patronymic' => 'sometimes|string|max:255',
            'birth_date' => 'nullable|date',
            'phone' => 'nullable|string|max:20',
            'telegram' => 'nullable|string|max:100',
            'apartment_number' => 'sometimes|string|max:10',
            'ownership_start_date' => 'sometimes|date',
            'ownership_end_date' => 'nullable|date|after:ownership_start_date',
            'is_verified' => 'sometimes|boolean',
        ]);

        // Автоматическая установка is_verified=0 при указании ownership_end_date
        if (isset($validated['ownership_end_date']) && $validated['ownership_end_date'] !== null) {
            $validated['is_verified'] = false;
        }

        // Преобразование номера квартиры в apartment_id
        if (isset($validated['apartment_number'])) {
            $apartment = Apartment::where('number', $validated['apartment_number'])->first();

            if (!$apartment) {
                return response()->json([
                    'message' => 'Квартира с таким номером не найдена'
                ], 404);
            }

            $validated['apartment_id'] = $apartment->id;
            unset($validated['apartment_number']);
        }

        // Обновление данных в транзакции
        DB::transaction(function () use ($validated, $owner) {
            // Обновление владельца
            $owner->update($validated);

            // Обновление статуса верификации пользователя
            if ($validated['is_verified'] === false && $owner->user) {
                $owner->user->update([
                    'verification_status' => 'unverified',
                    'role' => 'user'
                ]);
            }
        });

        Log::info('OwnerController update', ['Owner update' => $owner]);

        return response()->json([
            'message' => 'Данные владельца обновлены',
        ], 200);
    }

    public function endPreviousOwnership($newOwnerId)
    {
        $newOwner = Owner::findOrFail($newOwnerId);

        if (!$newOwner->apartment_id || !$newOwner->ownership_start_date) {
            return response()->json(['message' => 'Недостаточно данных'], 400);
        }

        // Находим предыдущего собственника
        $previousOwner = Owner::where('apartment_id', $newOwner->apartment_id)
            ->whereNull('ownership_end_date')
            ->where('id', '!=', $newOwnerId)
            ->first();

        if ($previousOwner) {
            $previousOwner->update([
                'ownership_end_date' => $newOwner->ownership_start_date
            ]);
        }

        return response()->json(['success' => true]);
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
            'verified_at' => now()
        ]);

        return response()->json(['message' => 'Владелец успешно верифицирован']);
    }

    public function destroy(Owner $owner)
    {
        $owner->delete();
        return response()->json(null, 204);
    }
}
