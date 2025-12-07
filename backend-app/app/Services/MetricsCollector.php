<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class MetricsCollector
{
    private static ?MetricsCollector $instance = null;
    private array $excludedServices;

    private array $requestMetrics = [];
    private bool $enabled;

    private function __construct()
    {
        $this->enabled = config('services.metrics.enabled', true);
        $this->excludedServices = config('services.metrics.excluded_services', []);
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function start(string $service, string $method): string
    {
        if (!$this->enabled || in_array($service, $this->excludedServices)) {
            return '';
        }

        $callId = uniqid('call_', true);

        $this->requestMetrics[$callId] = [
            'service' => $service,
            'method' => $method,
            'start_time' => microtime(true),
            'start_memory' => memory_get_usage(true),
            'call_id' => $callId,
        ];

        // Детальное логирование (опционально)
        if (config('services.metrics.detailed_logging', false)) {
            Log::channel('services')->debug('METHOD_START', [
                'service' => $service,
                'method' => $method,
                'call_id' => $callId,
                'memory_before_mb' => round($this->requestMetrics[$callId]['start_memory'] / 1024 / 1024, 4),
            ]);
        }

        return $callId;
    }

    public function end(string $callId, bool $success = true, ?\Throwable $exception = null): void
    {
        if (!$this->enabled || !isset($this->requestMetrics[$callId])) {
            return;
        }

        $metric = $this->requestMetrics[$callId];
        $endTime = microtime(true);
        $endMemory = memory_get_usage(true);

        $duration = $endTime - $metric['start_time'];
        $memoryUsed = max(0, $endMemory - $metric['start_memory']);
        $peakMemory = memory_get_peak_usage(true);

        $result = [
            'service' => $metric['service'],
            'method' => $metric['method'],
            'duration_ms' => round($duration * 1000, 4),
            'memory_used_bytes' => $memoryUsed,
            'memory_used_mb' => round($memoryUsed / 1024 / 1024, 4),
            'peak_memory_bytes' => $peakMemory,
            'peak_memory_mb' => round($peakMemory / 1024 / 1024, 4),
            'success' => $success,
            'call_id' => $callId,
            'timestamp' => now()->toISOString(),
        ];

        if (!$success && $exception) {
            $result['error'] = $exception->getMessage();
            $result['error_code'] = $exception->getCode();
        }

        // Сохраняем для агрегации
        $this->saveAggregatedMetric($result);

        // Логируем детали
        $this->logMetric($result, $success);

        // Удаляем из временного хранилища
        unset($this->requestMetrics[$callId]);
    }

    private function saveAggregatedMetric(array $metric): void
    {
        if (!isset($this->requestMetrics['_aggregated'])) {
            $this->requestMetrics['_aggregated'] = [];
        }

        $key = $metric['service'] . '::' . $metric['method'];

        if (!isset($this->requestMetrics['_aggregated'][$key])) {
            $this->requestMetrics['_aggregated'][$key] = [
                'service' => $metric['service'],
                'method' => $metric['method'],
                'count' => 0,
                'total_duration_ms' => 0,
                'total_memory_bytes' => 0,
                'total_peak_memory_bytes' => 0,
                'success_count' => 0,
                'error_count' => 0,
                'min_duration_ms' => PHP_FLOAT_MAX,
                'max_duration_ms' => 0,
            ];
        }

        $agg = &$this->requestMetrics['_aggregated'][$key];
        $agg['count']++;
        $agg['total_duration_ms'] += $metric['duration_ms'];
        $agg['total_memory_bytes'] += $metric['memory_used_bytes'];
        $agg['total_peak_memory_bytes'] += $metric['peak_memory_bytes'];

        if ($metric['success']) {
            $agg['success_count']++;
        } else {
            $agg['error_count']++;
        }

        $agg['min_duration_ms'] = min($agg['min_duration_ms'], $metric['duration_ms']);
        $agg['max_duration_ms'] = max($agg['max_duration_ms'], $metric['duration_ms']);
    }

    private function logMetric(array $metric, bool $success): void
    {
        $logLevel = $success ? 'info' : 'error';
        $logMessage = $success ? 'METHOD_SUCCESS' : 'METHOD_ERROR';

        $logData = [
            'service' => $metric['service'],
            'method' => $metric['method'],
            'duration_ms' => $metric['duration_ms'],
            'memory_used_mb' => $metric['memory_used_mb'],
            'peak_memory_mb' => $metric['peak_memory_mb'],
            'call_id' => $metric['call_id'],
        ];

        if (!$success) {
            $logData['error'] = $metric['error'] ?? 'Unknown error';
        }

        Log::channel('services')->log($logLevel, $logMessage, $logData);
    }

    public function getAggregatedMetrics(): array
    {
        $aggregated = $this->requestMetrics['_aggregated'] ?? [];

        $services = [];
        $totalCalls = 0;
        $totalTime = 0;
        $totalMemory = 0;

        foreach ($aggregated as $key => $metrics) {
            $service = $metrics['service'];

            if (!isset($services[$service])) {
                $services[$service] = [
                    'service' => $service,
                    'total_calls' => 0,
                    'total_time_ms' => 0,
                    'total_memory_bytes' => 0,
                    'methods' => [],
                ];
            }

            $services[$service]['total_calls'] += $metrics['count'];
            $services[$service]['total_time_ms'] += $metrics['total_duration_ms'];
            $services[$service]['total_memory_bytes'] += $metrics['total_memory_bytes'];

            $services[$service]['methods'][] = [
                'method' => $metrics['method'],
                'count' => $metrics['count'],
                'total_time_ms' => $metrics['total_duration_ms'],
                'avg_time_ms' => round($metrics['total_duration_ms'] / $metrics['count'], 4),
                'min_time_ms' => $metrics['min_duration_ms'],
                'max_time_ms' => $metrics['max_duration_ms'],
                'success_count' => $metrics['success_count'],
                'error_count' => $metrics['error_count'],
                'success_rate' => round($metrics['success_count'] / $metrics['count'] * 100, 2) . '%',
                'total_memory_bytes' => $metrics['total_memory_bytes'],
                'avg_memory_bytes' => round($metrics['total_memory_bytes'] / $metrics['count']),
                'avg_memory_mb' => round($metrics['total_memory_bytes'] / $metrics['count'] / 1024 / 1024, 4),
            ];

            $totalCalls += $metrics['count'];
            $totalTime += $metrics['total_duration_ms'];
            $totalMemory += $metrics['total_memory_bytes'];
        }

        return [
            'total_calls' => $totalCalls,
            'total_time_ms' => round($totalTime, 2),
            'total_memory_bytes' => $totalMemory,
            'total_memory_mb' => round($totalMemory / 1024 / 1024, 4),
            'services' => array_values($services),
        ];
    }

    public function clear(): void
    {
        $this->requestMetrics = [];
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }
}
