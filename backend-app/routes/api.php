<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\VerificationController;
use App\Http\Controllers\Api\WeatherController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\ContactRequestController;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/logout', [LoginController::class, 'logout']);
});

Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])
    ->name('verification.verify');

Route::post('/email/resend', [VerificationController::class, 'resend'])
    ->middleware('auth:sanctum');

// Роут для получения даных о погоде для всех
Route::get('/weather', WeatherController::class);

// Роуты для получения обьявлений для всех
Route::get('/announcements', [AnnouncementController::class, 'index']);

// Роуты для аутентифецированных пользователей // 'user', 'owner', 'admin'
Route::middleware(['auth:sanctum', 'verified'])->group(function () {

    // Получение данных о себе
    Route::get('/user', [UserController::class, 'current']);
    // Обращения пользователей
    Route::post('/feedback', [ContactRequestController::class, 'store'])->middleware('role:user,owner');

    // Роуты для собственников 'owner'
    Route::middleware(['auth:sanctum', 'verified'])->group(function () {
        // Route::get('/user', [UserController::class, 'current'])->middleware('role:owner');
    });


    // Роуты для администраторов 'admin'
    // Создание и удаление объявлений
    Route::post('/announcements', [AnnouncementController::class, 'store'])->middleware('role:admin');
    Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy'])->middleware('role:admin');


});



Route::get('/test-redis-connection', function () {
    try {
        Cache::store('redis')->put('connection_test', 'success', 10);
        return response()->json([
            'status' => Cache::store('redis')->get('connection_test')
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
});
