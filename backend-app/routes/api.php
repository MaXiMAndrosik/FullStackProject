<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\VerificationController;
use App\Http\Controllers\Auth\VerificationOwnerController;
use App\Http\Controllers\Api\WeatherController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AppealsController;
use App\Http\Controllers\Api\OwnerController;
use App\Http\Controllers\Api\Admin\ServiceController;
use App\Http\Controllers\Api\Admin\ServiceAssignmentController;
use App\Http\Controllers\Api\Admin\TariffController;
use App\Http\Controllers\Api\Admin\ApartmentController;
use App\Http\Controllers\Api\Admin\AssignmentTariffController;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum');
});

Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])
    ->name('verification.verify');

Route::post('/email/resend', [VerificationController::class, 'resend'])
    ->middleware('auth:sanctum');

// Роут для получения даных о погоде для всех
Route::get('/weather', WeatherController::class);

// Роуты для получения обьявлений для всех
Route::get('/announcements', [AnnouncementController::class, 'index']);




// Роуты для аутентифицированных пользователей // 'user', 'owner', 'admin'
Route::middleware(['auth:sanctum', 'verified'])->group(function () {

    // Обращения пользователей
    Route::post('/appeals', [AppealsController::class, 'store']);

    // Получение данных о себе
    Route::get('/user', [UserController::class, 'current']);
    // Удаление аккаунта
    Route::delete('/user', [UserController::class, 'currentDestroy']);


    // Роуты для пользователей 'users' для верификации собственника
    Route::post('/user/verification-request', [VerificationOwnerController::class, 'store'])->middleware('role:user');
    Route::get('/user/my-verification-request', [VerificationOwnerController::class, 'getMyRequest'])->middleware('role:user');



    // ---------------------------------------------------------------------------------------------------------------------------
    // Роуты для собственников 'owner'
    // ---------------------------------------------------------------------------------------------------------------------------
    Route::middleware(['auth:sanctum', 'verified', 'role:owner'])->group(function () {
        // Получение данных о собственнике 
        Route::get('/owner/by-user/{user_id}', [OwnerController::class, 'getByUserId']);
        // Получение данных о собственнике с данными о жилом помещении
        Route::get('/owner/profile', [OwnerController::class, 'profile']);
        // Получение данных о действующих услугах и тарифах для собственника
        Route::get('/owner/services', [ServiceController::class, 'show']);
        Route::get('/owner/service-assignments', [ServiceAssignmentController::class, 'show']);
    });

    // ---------------------------------------------------------------------------------------------------------------------------
    // Роуты для администраторов 'admin'
    // ---------------------------------------------------------------------------------------------------------------------------
    Route::middleware(['auth:sanctum', 'verified', 'role:admin'])->group(function () {

        // Создание и удаление объявлений
        Route::post('/announcements', [AnnouncementController::class, 'store']);
        Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);

        // Создание, удаление и редактирование сервисов ЖКУ и тарифов к ним
        Route::apiResource('/admin/services', ServiceController::class)->except(['show']);
        Route::put('/admin/services/{service}/toggle-active', [ServiceController::class, 'toggleActive']);
        Route::apiResource('/admin/tariffs', TariffController::class);

        // Создание, удаление и редактирование сервисов отдельных услуг и тарифов к ним
        Route::apiResource('/admin/service-assignments', ServiceAssignmentController::class)->except(['show']);
        Route::put('/admin/service-assignments/{service_assignment}/toggle-active', [ServiceAssignmentController::class, 'toggleActive']);
        Route::apiResource('/admin/assignment-tariffs', AssignmentTariffController::class);

        // Создание, удаление и редактирование собственников
        Route::apiResource('/admin/owners', OwnerController::class)->except(['show']);

        // Верификация пользователей
        Route::get('/admin/verification-requests', [VerificationOwnerController::class, 'index']);
        Route::post('/admin/verification/{id}/approve', [VerificationOwnerController::class, 'approve']);
        Route::post('/admin/verification/{id}/reject', [VerificationOwnerController::class, 'reject']);
        Route::delete('admin/verification-requests/{id}', [VerificationOwnerController::class, 'destroy']);

        // Редактирование пользователей
        Route::apiResource('/admin/users', UserController::class)->except(['show']);


        Route::apiResource('/admin/apartments', ApartmentController::class);

    });
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
