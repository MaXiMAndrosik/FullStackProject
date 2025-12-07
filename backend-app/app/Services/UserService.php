<?php

namespace App\Services;

use App\Traits\CollectsMetrics;

class UserService
{
    use CollectsMetrics;

    public function getTestUser(): array
    {
        return $this->withMetrics(__FUNCTION__, function () {
            usleep(100000); // 100ms задержка для теста
            return [
                'id' => 1,
                'name' => 'Test User',
                'email' => 'test@example.com',
                'created_at' => now()->toISOString(),
            ];
        });
    }

    public function getUserProfile(int $userId): array
    {
        return $this->withMetrics(__FUNCTION__, function () use ($userId) {
            usleep(200000); // 200ms задержка
            return [
                'id' => $userId,
                'name' => 'User ' . $userId,
                'profile' => [
                    'bio' => 'This is a test bio for user ' . $userId,
                    'avatar' => 'https://example.com/avatar/' . $userId,
                ],
                'statistics' => [
                    'posts' => rand(10, 100),
                    'followers' => rand(100, 1000),
                ]
            ];
        });
    }

    public function createUser(array $userData): array
    {
        return $this->withMetrics(__FUNCTION__, function () use ($userData) {
            usleep(150000); // 150ms
            return [
                'id' => rand(1000, 9999),
                ...$userData,
                'status' => 'active',
                'created_at' => now()->toISOString(),
                'updated_at' => now()->toISOString(),
            ];
        });
    }

    public function getUserWithError(int $userId): array
    {
        return $this->withMetrics(__FUNCTION__, function () use ($userId) {
            if ($userId < 1) {
                throw new \InvalidArgumentException('User ID must be positive');
            }

            usleep(100000);
            return [
                'id' => $userId,
                'name' => 'Valid User',
            ];
        });
    }

    public function memoryIntensiveOperation(int $size = 10000): array
    {
        return $this->withMetrics(__FUNCTION__, function () use ($size) {
            // Создаем большой массив для потребления памяти
            $bigArray = [];
            for ($i = 0; $i < $size; $i++) {
                $bigArray[] = [
                    'id' => $i,
                    'data' => str_repeat('x', 1000),
                    'nested' => [
                        'level1' => [
                            'level2' => [
                                'level3' => str_repeat('y', 500)
                            ]
                        ]
                    ]
                ];
            }

            usleep(500000); // 500ms
            return [
                'array_size' => count($bigArray),
                'memory_used' => memory_get_usage(true),
                'memory_peak' => memory_get_peak_usage(true),
            ];
        });
    }

    public function variableMemoryOperation(string $complexity = 'low'): array
    {
        return $this->withMetrics(__FUNCTION__, function () use ($complexity) {
            $sizeMap = [
                'low' => 100,
                'medium' => 1000,
                'high' => 10000
            ];

            $size = $sizeMap[$complexity] ?? 100;
            $data = [];

            for ($i = 0; $i < $size; $i++) {
                $data["item_$i"] = str_repeat('data', $i % 100);
            }

            usleep(200000); // 200ms
            return [
                'complexity' => $complexity,
                'items_count' => count($data),
                'estimated_memory' => strlen(serialize($data)),
            ];
        });
    }
}
