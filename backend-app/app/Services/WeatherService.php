<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class WeatherService
{
    private string $apiKey;
    private string $baseUrl;
    private string $defaultCity;
    private string $units;
    private string $lang;

    public function __construct()
    {
        $this->validateConfig();

        $this->apiKey = Config::get('services.weather.key');
        $this->baseUrl = Config::get('services.weather.url');
        $this->defaultCity = Config::get('services.weather.default_city');
        $this->units = Config::get('services.weather.units');
        $this->lang = Config::get('services.weather.lang');
    }

    private function validateConfig(): void
    {
        $required = [
            'services.weather.key',
            'services.weather.url',
            'services.weather.default_city',
            'services.weather.units',
            'services.weather.lang'
        ];

        foreach ($required as $key) {
            if (Config::get($key) === null) {
                throw new \RuntimeException("Missing required config: $key");
            }
        }
    }

    public function getWeatherData(string $city = null): array
    {
        $city = $city ?? $this->defaultCity;
        $cacheKey = "weather_{$city}_{$this->units}_{$this->lang}";

        return Cache::remember($cacheKey, 3600, function () use ($city) {
            $response = Http::get($this->baseUrl, [
                'q' => $city,
                'appid' => $this->apiKey,
                'units' => $this->units,
                'lang' => $this->lang,
            ]);

            if ($response->failed()) {
                Log::error('Weather API Error', [
                    'city' => $city,
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);
                throw new \Exception("Weather API error: {$response->status()}");
            }

            return $response->json();
        });
    }
}
