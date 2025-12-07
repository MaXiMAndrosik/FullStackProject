<?php

namespace App\Traits;

use App\Services\MetricsCollector;

trait CollectsMetrics
{
    /**
     * Выполнить метод со сбором метрик
     */
    protected function withMetrics(string $methodName, callable $callback, ...$args)
    {
        $collector = MetricsCollector::getInstance();

        // Если метрики отключены, просто выполняем callback
        if (!$collector->isEnabled()) {
            return $callback(...$args);
        }

        $callId = $collector->start(static::class, $methodName);

        try {
            $result = $callback(...$args);
            $collector->end($callId, true);
            return $result;
        } catch (\Throwable $e) {
            $collector->end($callId, false, $e);
            throw $e;
        }
    }

    /**
     * Получить метрики сервиса (для обратной совместимости)
     */
    public function getServiceMetrics(): array
    {
        $collector = MetricsCollector::getInstance();
        $aggregated = $collector->getAggregatedMetrics();

        $serviceName = static::class;
        foreach ($aggregated['services'] as $service) {
            if ($service['service'] === $serviceName) {
                return $service;
            }
        }

        return [
            'service' => $serviceName,
            'total_calls' => 0,
            'total_time_ms' => 0,
            'total_memory_bytes' => 0,
            'methods' => [],
        ];
    }
}
