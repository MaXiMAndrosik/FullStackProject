<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Models\Owner;
use App\Models\VerificationOwners;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationRequestedOwnerMail;
use App\Mail\VerificationResult;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class VerificationOwnerController extends Controller
{

    // Получение данных о верификации пользователем
    public function getMyRequest(Request $request)
    {
        $user = $request->user();

        return $this->getByUserId($user->id);
    }

    // Получение о верификации через user_id
    public function getByUserId($user_id)
    {
        // Поиск запроса верификации по ID пользователя
        $verificationRequest = VerificationOwners::where('user_id', $user_id)
            ->where('status', 'pending')
            ->first();

        if (!$verificationRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Запрос на верификацию не найден'
            ], 404);
        }

        return response()->json($verificationRequest, 200);
    }

    // Отправка запроса пользователем на верификацию
    public function store(Request $request)
    {
        $user = $request->user();

        Log::debug('VerificationOwnerController::store', ['Request' => $request->all()]);

        $data = $request->validate([
            'last_name' => 'required|string|max:100',
            'first_name' => 'required|string|max:100',
            'patronymic' => 'nullable|string|max:100',
            'birth_date' => 'required|date',
            'phone' => 'required|string|max:20',
            'apartment_number' => 'required|string|max:10',
        ]);

        // Проверка существования собственника
        $ownerExists = Owner::where('apartment_id', $data['apartment_number'])
            ->where('last_name', $data['last_name'])
            ->where('first_name', $data['first_name'])
            ->where('patronymic', $data['patronymic'])
            ->where('ownership_end_date', null)
            ->exists();

        if (!$ownerExists) {
            return response()->json([
                'success' => false,
                'message' => 'Собственник с указанными данными не найден',
            ], 422);
        }

        // Создание запроса
        $verificationRequest = VerificationOwners::create([
            'user_id' => $user->id,
            ...$data
        ]);

        // Обновление статуса пользователя
        $user->update(['verification_status' => 'pending']);

        // Отправка уведомления администраторам
        $recipientEmail = config('mail.contact_recipient');
        Mail::to($recipientEmail)->send(new VerificationRequestedOwnerMail($verificationRequest));

        Log::info('VerificationOwnerController::store', ['verificationRequest' => $verificationRequest]);

        return response()->json([
            'success' => true,
            'message' => 'Запрос на верификацию отправлен администраторам'
        ]);
    }

    // Подтверждение верификации администратором
    public function approve($id)
    {

        $verificationRequest = VerificationOwners::findOrFail($id);

        $user = $verificationRequest->user;

        // Поиск соответствующего собственника
        $owner = Owner::where('last_name', $verificationRequest->last_name)
            ->where('first_name', $verificationRequest->first_name)
            ->firstOrFail();

        // Привязка пользователя к собственнику
        $owner->update([
            'user_id' => $user->id,
            'birth_date' => Carbon::parse($verificationRequest->birth_date)->format('Y-m-d'),
            'phone' => $verificationRequest->phone ? (string)$verificationRequest->phone : null,
            'is_verified' => true,
            'verified_at' => now(),
        ]);

        // // Обновление статуса пользователя
        $user->update([
            'role' => 'owner',
            'verification_status' => 'verified',
        ]);

        // // Отправка уведомления пользователю
        // Mail::to($user->email)->send(
        //     new VerificationResult($verificationRequest, 'approved')
        // );

        try {
            Mail::to('zenitchik-4@yandex.ru')->send(new VerificationResult($verificationRequest, 'approved'));
        } catch (\Exception $e) {
            Log::error('Email sending failed', [
                'error' => $e->getMessage(),
                'email' => 'zenitchik-4@yandex.ru'
            ]);
        }

        // // Удаление запроса
        $verificationRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Пользователь успешно верифицирован как собственник'
        ]);
    }

    // Отклонение верификации администратором
    public function reject($id, Request $request)
    {
        $verificationRequest = VerificationOwners::findOrFail($id);

        $verificationRequest->update([
            'status' => 'rejected',
        ]);

        // Отправка email
        $user = User::findOrFail($verificationRequest->user_id);
        // Mail::to($user->email)->send(
        //     new VerificationResult($verificationRequest, 'rejected')
        // );

        // // Обновление статуса пользователя
        $user->update([
            'verification_status' => 'unverified',
        ]);

        try {
            Mail::to('zenitchik-4@yandex.ru')->send(new VerificationResult($verificationRequest, 'rejected'));
        } catch (\Exception $e) {
            Log::error('Email sending failed', [
                'error' => $e->getMessage(),
                'email' => 'zenitchik-4@yandex.ru'
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Запрос отклонен'
        ]);
    }

    // Удаление отклоненной администратором верификации 
    public function destroy($id)
    {
        $request = VerificationOwners::findOrFail($id);

        // Проверяем, можно ли удалять (только отклоненные или обработанные)
        if ($request->status === 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Нельзя удалить необработанную заявку'
            ], 403);
        }

        $request->delete();

        Log::info('VerificationOwnerController::destroy', ['Удаление запроса пользователя' => $request]);

        return response()->json([
            'success' => true,
            'message' => 'Заявка удалена'
        ]);
    }

    // Получение всех запросов на верификацию (для админов)
    public function index()
    {
        $requests = VerificationOwners::with(['user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'requests' => $requests
        ]);
    }
}
