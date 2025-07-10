<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class VerificationController extends Controller
{
    /**
     * Verify email
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @param  string  $hash
     * @return \Illuminate\Http\JsonResponse
     */
    public function verify($id, $hash)
    {
        $user = User::findOrFail($id);

        // Проверка срока действия ссылки (10 минут)
        if ($user->verification_sent_at && $user->verification_sent_at->addMinutes(10)->isPast()) {
            Log::warning('Expired verification link', ['Username' => $user->name]);
            return redirect(config('app.frontend_url') . '/resend-verification');
        }

        if (!hash_equals($hash, sha1($user->getEmailForVerification()))) {
            Log::warning('Invalid verification attempt', ['Username' => $user->name]);
            abort(403, 'Неверная ссылка верификации');
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            Log::info('Email verified', ['Username' => $user->name]);
        }

        Auth::login($user);
        Log::debug('Auth::login($user)', ['Username' => $user->name]);

        Log::debug('CSRF Debug VerificationController', [
            'token' => csrf_token(),
            'session_id' => session()->getId(),
            'session_data' => session()->all(),
            'user' => $user
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return redirect(config('app.frontend_url') . '/auth-callback?verified=true&token=' . $token);

    }

    /**
     * Verify token
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function gettoken(Request $request)
    {
        $code = $request->input('code');

        $userId = Cache::pull('email_verify:' . $code);

        if (!$userId) {
            return response()->json(['error' => 'Invalid code'], 401);
        }

        $user = User::find($userId);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['token' => $token]);
    }


    /**
     * Resend verification email
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resend(Request $request)
    {

        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Пользователь не найден'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email уже верифицирован'], 400);
        }

        $user->verification_sent_at = now();
        $user->save();

        $request->user()->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Ссылка для подтверждения отправлена'
        ]);
    }
}
