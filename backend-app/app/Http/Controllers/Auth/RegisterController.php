<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Registered;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Log;

class RegisterController extends Controller
{
    public function register(Request $request)
    {

        Log::debug('Register started', ['request' => $request->all(), 'ip' => $request->ip()]);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
        ]);

        $user->verification_sent_at = now();
        $user->save();

        Log::debug('User create', ['Username' => $user->name, 'Useremail' => $user->email]);

        event(new Registered($user));

        Log::debug('User Registered', ['Username' => $user->name, 'Useremail' => $user->email]);

        Log::debug('CSRF Debug RegisterController', [
            'token' => csrf_token(),
            'session_id' => session()->getId(),
            'session_data' => session()->all()
        ]);

        return response()->json([
            'message' => 'Письмо с подтверждением отправлено на ваш email',
            'requires_verification' => true,
        ], 200);
    }
}
