<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function current(Request $request)
    {
        $user = $request->user();

        Log::debug('UserController current', [
            'user_id' => $user->id,
            'email' => $user->email
        ]);

        return response()->json($request->user()->only('id', 'name', 'email', 'role', 'verification_status'));

    }

    /**
     * Удаление текущего пользователя
     */
    public function destroy(Request $request)
    {
        $user = $request->user();

        // Проверка аутентификации
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Пользователь не аутентифицирован'
            ], 401);
        }

        try {

            $user->tokens()->delete();
            $user->delete();

            Log::info('Пользователь удален', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Аккаунт успешно удален'
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка удаления пользователя', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ошибка при удалении аккаунта'
            ], 500);
        }
    }
}
