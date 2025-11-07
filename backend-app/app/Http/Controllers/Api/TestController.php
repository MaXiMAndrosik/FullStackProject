<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class TestController extends Controller
{
    public function publicData(): JsonResponse
    {
        return response()->json([
            'message' => 'Public API работает!',
            'cors' => 'CORS настроен правильно',
            'timestamp' => now(),
            'data' => [
                'announcements' => [
                    ['id' => 1, 'title' => 'Тестовое объявление 1', 'content' => 'Содержание 1'],
                    ['id' => 2, 'title' => 'Тестовое объявление 2', 'content' => 'Содержание 2'],
                ],
                'weather' => [
                    'temperature' => 20,
                    'condition' => 'sunny'
                ]
            ]
        ]);
    }
}
