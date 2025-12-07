<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use App\Services\MetricsCollector;

class ServiceMetricsMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        $collector = MetricsCollector::getInstance();

        if (!$collector->isEnabled()) {
            return;
        }

        try {
            $metrics = $collector->getAggregatedMetrics();

            // Логируем только если были вызовы сервисов
            if ($metrics['total_calls'] === 0) {
                $collector->clear();
                return;
            }

            $logData = [
                'request_id' => $request->header('X-Request-ID') ?? uniqid('req_'),
                'timestamp' => now()->toISOString(),
                'request' => [
                    'method' => $request->method(),
                    'url' => $request->fullUrl(),
                    'status_code' => $response->getStatusCode(),
                    'path' => $request->path(),
                ],
                'performance' => [
                    'total_service_calls' => $metrics['total_calls'],
                    'total_service_time_ms' => $metrics['total_time_ms'],
                    'total_memory_bytes' => $metrics['total_memory_bytes'],
                    'total_memory_mb' => $metrics['total_memory_mb'],
                    'peak_memory_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
                    'has_service_calls' => $metrics['total_calls'] > 0,
                ],
                'services' => $metrics['services'],
            ];

            // Добавляем дополнительную информацию для анализа
            if (!empty($metrics['services'])) {
                foreach ($metrics['services'] as &$service) {
                    $service['avg_time_per_call_ms'] = round($service['total_time_ms'] / $service['total_calls'], 2);
                    $service['avg_memory_per_call_mb'] = round($service['total_memory_bytes'] / $service['total_calls'] / 1024 / 1024, 4);

                    // Находим самый медленный метод
                    $slowestMethod = null;
                    foreach ($service['methods'] as $method) {
                        if (!$slowestMethod || $method['avg_time_ms'] > $slowestMethod['avg_time_ms']) {
                            $slowestMethod = $method;
                        }
                    }

                    if ($slowestMethod) {
                        $service['slowest_method'] = [
                            'name' => $slowestMethod['method'],
                            'avg_time_ms' => $slowestMethod['avg_time_ms'],
                            'count' => $slowestMethod['count'],
                        ];
                    }
                }
            }

            Log::channel('services_metrics')->info('REQUEST_METRICS', $logData);

            // Очищаем метрики после логирования
            $collector->clear();
        } catch (\Throwable $e) {
            Log::channel('services_metrics')->error('METRICS_ERROR', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'url' => $request->fullUrl(),
            ]);
        }
    }
}
