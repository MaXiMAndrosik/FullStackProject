<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Owner;
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
    public function currentDestroy(Request $request)
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

    /**
     * Получение всех пользователей администратором
     */
    public function index()
    {

        $users = User::all();
        return response()->json($users);
    }

    /**
     * Обновление данных пользователя администратором
     */
    public function update(Request $request, User $user)
    {
        Log::debug('OwnerController update', [
            'Request' => $request->all(),
            'User' => $user
        ]);

        $validated = $request->validate([
            'role' => 'required|in:user,owner,admin',
        ]);

        Log::debug('OwnerController update', [
            'validated' => $validated,
        ]);

        if ($user->role === "owner") {
            return response()->json([
                'message' => 'Нельзя вносить изменения в данную запись',
            ], 400);
        }

        if ($validated['role'] === "admin") {
            $user->update([
                'verification_status' => 'verified',
                'role' => 'admin'
            ]);
        } elseif ($validated['role'] === "user") {
            $user->update([
                'verification_status' => 'unverified',
                'role' => 'user'
            ]);
        }

        return response()->json([
            'message' => 'Данные пользователя обновлены',
        ], 200);
    }

    /**
     * Удаление данных пользователя администратором
     */
    public function destroy($id)
    {

        Log::debug('UserController destroy', ['User delete' => $id]);


        try {

            $user = User::findOrFail($id);

            // Отсоединяем связанные данные перед удалением
            if ($user->owner) {
                $user->owner()->update([
                    'user_id' => null,
                    'is_verified' => false
                ]);
            }

            $user->delete();

            Log::info('UserController destroy', ['User delete' => $user]);

            return response()->json([
                'success' => true,
                'message' => 'Пользователь успешно удален'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Пользователь не найден'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при удалении пользователя',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
