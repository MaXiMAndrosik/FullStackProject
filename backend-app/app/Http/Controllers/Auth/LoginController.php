<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LoginController extends Controller
{
    /**
     *  Аутентификация
     */
    public function login(Request $request)
    {

        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'remember' => 'boolean',
        ]);

        $remember = $request->boolean('remember', false);

        // Попытка аутентификации
        if (!Auth::attempt($request->only('email', 'password'), $remember)) {
            Log::warning('Failed login attempt', ['email' => $request->email, 'ip' => $request->ip()]);
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $user = $request->user();

        if (!$user->hasVerifiedEmail()) {
            Auth::logout();
            return response()->json([
                'message' => 'Email не подтвержден',
                'requires_verification' => true,
            ], 403);
        }

        Log::info('User logged in', ['Username' => $user->name]);

        return response()->json([
            'user' => Auth::user(),
            'token' => $request->user()->createToken('auth_token')->plainTextToken
        ]);
    }

    /**
     * Выход пользователя.
     */
    public function logout(Request $request)
    {

        $user = $request->user();

        $user->tokens()->delete();

        Auth::logout();

        return response()->json([
            'message' => 'Успешный выход'
        ])->withoutCookie('auth_token');
    }
}
