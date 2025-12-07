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
use App\Http\Controllers\Api\Admin\MeterTypeController;
use App\Http\Controllers\Api\Admin\MeterController;
use App\Http\Controllers\Api\MeterReadingController;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

// Обработка CORS preflight OPTIONS запросов
Route::options('/{any}', function () {
    return response()->noContent();
})->where('any', '.*');

Route::get('/test-public', [\App\Http\Controllers\Api\TestController::class, 'publicData']);

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
        // Показания счетчиков для собственника
        Route::get('/owner/meter-readings', [MeterReadingController::class, 'forOwner']);
        Route::post('/owner/meter-readings', [MeterReadingController::class, 'store']);
        Route::put('/owner/meter-readings/{meterReading}', [MeterReadingController::class, 'update']);
    });

    // ---------------------------------------------------------------------------------------------------------------------------
    // Роуты для администраторов 'admin'
    // ---------------------------------------------------------------------------------------------------------------------------
    Route::middleware(['auth:sanctum', 'verified', 'role:admin'])->group(function () {

        // Создание и удаление объявлений
        Route::post('/announcements', [AnnouncementController::class, 'store']);
        Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);

        // Обращения пользователей
        Route::apiResource('/admin/appeals', AppealsController::class)->except(['store']);

        // Создание, удаление и редактирование сервисов ЖКУ и тарифов к ним
        Route::apiResource('/admin/services', ServiceController::class)->except(['show']);
        Route::put('/admin/services/{service}/toggle-active', [ServiceController::class, 'toggleActive']);
        Route::get('/admin/tariffs/old', [TariffController::class, 'oldTariffs']);
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

        // Управление квартирами собственников
        Route::apiResource('/admin/apartments', ApartmentController::class);

        // Управление счетчиками квартир
        Route::apiResource('/admin/meter-types', MeterTypeController::class);
        Route::post('/admin/meters/bulk-delete', [MeterController::class, 'bulkDelete']);
        Route::patch('/admin/meters/bulk-toggle', [MeterController::class, 'bulkToggle']);
        Route::patch('/admin/meters/{meter}/toggle', [MeterController::class, 'toggleStatus']);
        Route::apiResource('/admin/meters', MeterController::class);

        // Получение счетчиков по квартире
        Route::get('apartments/{apartment}/meters', [MeterController::class, 'byApartment']);

        // Управление показаниями счетчиков
        Route::get('/admin/meter-readings', [MeterReadingController::class, 'index']);
        Route::post('/admin/meter-readings/bulk', [MeterReadingController::class, 'bulkStore']);
        Route::post('/admin/meter-readings', [MeterReadingController::class, 'store']);
        Route::put('/admin/meter-readings/{meterReading}', [MeterReadingController::class, 'update']);
        Route::delete('/admin/meter-readings/{meterReading}', [MeterReadingController::class, 'destroy']);
        Route::get('/admin/meters/{meter}/readings', [MeterReadingController::class, 'byMeter']);
        Route::post('/meter-readings/fix', [MeterReadingController::class, 'fixReadings']);
        Route::post('/meter-readings/unfix', [MeterReadingController::class, 'unfixReadings']);
    });
});

/**
 * Тест работы redis
 * GET http://localhost:8000/api/test-redis-connection
 */
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

// Тестовые роуты для проверки кэша
Route::prefix('debug/cache')->group(function () {
    // 1. Просмотр всех ключей кэша
    Route::get('/keys', function () {
        $redis = Redis::connection();
        $keys = $redis->keys('*');

        $data = [];
        foreach ($keys as $key) {
            $type = $redis->type($key);
            $ttl = $redis->ttl($key);
            $value = $redis->get($key);

            try {
                $decoded = json_decode($value, true);
                $data[] = [
                    'key' => $key,
                    'type' => $type,
                    'ttl' => $ttl,
                    'value' => $decoded ?? $value,
                    'raw_value' => $value,
                ];
            } catch (\Exception $e) {
                $data[] = [
                    'key' => $key,
                    'type' => $type,
                    'ttl' => $ttl,
                    'value' => 'Cannot decode',
                    'raw_value' => $value,
                ];
            }

            return response()->json($data);
        }

        return response()->json(['error' => 'Unsupported cache driver']);
    });

    // 2. Просмотр конкретного ключа
    Route::get('/get/{key}', function ($key) {
        $value = Cache::get($key);

        return response()->json([
            'key' => $key,
            'value' => $value,
            'exists' => Cache::has($key),
        ]);
    });

    // 3. Очистка всего кэша
    Route::post('/flush', function () {
        $result = Cache::flush();

        return response()->json([
            'success' => true,
            'message' => 'Cache flushed',
            'result' => $result,
        ]);
    });

    // 4. Проверка кэша billing периода
    Route::get('/billing-period', function () {
        $today = now()->format('Y-m-d');
        $cacheKey = "billing:editing_period:{$today}";

        return response()->json([
            'cache_key' => $cacheKey,
            'cache_exists' => Cache::has($cacheKey),
            'cache_value' => Cache::get($cacheKey),
            'cache_ttl' => Redis::connection()->ttl(config('cache.prefix') . ':' . $cacheKey),
        ]);
    });

    // 5. Удаление конкретного ключа
    Route::delete('/delete/{key}', function ($key) {
        $deleted = Cache::forget($key);

        return response()->json([
            'success' => $deleted,
            'message' => $deleted ? 'Key deleted' : 'Key not found',
            'key' => $key,
        ]);
    });
});

/**
 * Тест системы метрик с трейтом
 * GET http://localhost:8000/api/test-metrics-trait
 */
Route::get('/test-metrics-trait', function () {
    $userService = app(\App\Services\UserService::class);

    $results = [];
    $results['test_user'] = $userService->getTestUser();
    $results['test_user'] = $userService->getTestUser();
    $results['test_user'] = $userService->getTestUser();
    $results['user_profile'] = $userService->getUserProfile(1);
    $results['create_user'] = $userService->createUser([
        'name' => 'Metrics Test User',
        'email' => 'metrics@test.com'
    ]);

    // Тест ошибки
    try {
        $results['error_test'] = $userService->getUserWithError(0);
    } catch (\Exception $e) {
        $results['error_handled'] = $e->getMessage();
    }

    return response()->json([
        'message' => 'Metrics trait test completed',
        'results' => $results,
        'note' => 'Check services.log and services-metrics.log for metrics',
        'timestamp' => now()->toISOString(),
    ]);
});
