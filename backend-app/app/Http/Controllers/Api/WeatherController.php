<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WeatherService;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class WeatherController extends Controller
{
    public function __invoke(Request $request, WeatherService $weatherService)
    {
        $validated = $request->validate([
            'city' => 'sometimes|string|max:100'
        ]);

        try {
            Log::debug('WeatherController get', ['Request' => $request->all()]);
            return $weatherService->getWeatherData($validated['city'] ?? null);
        } catch (\Exception $e) {
            Log::warning('WeatherController get fail', ['Exception' => $e->getMessage()]);
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Временный тест в WeatherController
    public function testRedis()
    {
        Cache::put('test_key', 'test_value', 60); // 60 секунд
        $value = Cache::get('test_key');

        return response()->json([
            'redis_test_value' => $value,
            'redis_connection' => config('cache.default')
        ]);
    }
}
