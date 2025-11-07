<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;

// Явные маршруты для статических файлов
Route::get('/manifest.json', function () {
    $path = public_path('manifest.json');
    if (!File::exists($path)) {
        abort(404);
    }

    return response()
        ->file($path, ['Content-Type' => 'application/json']);
});

Route::get('/robots.txt', function () {
    $path = public_path('robots.txt');
    if (!File::exists($path)) {
        abort(404);
    }

    return response()
        ->file($path, ['Content-Type' => 'text/plain']);
});

Route::get('/favicon.ico', function () {
    $path = public_path('favicon.ico');
    if (!File::exists($path)) {
        abort(404);
    }

    return response()
        ->file($path, ['Content-Type' => 'image/x-icon']);
});

Route::get('/asset-manifest.json', function () {
    $path = public_path('asset-manifest.json');
    if (!File::exists($path)) {
        abort(404);
    }

    return response()
        ->file($path, ['Content-Type' => 'application/json']);
});

// API routes
Route::prefix('api')->group(function () {
    require __DIR__ . '/api.php';
});

// Serve storage files
Route::get('/storage/{path}', function ($path) {
    $path = storage_path('app/public/' . $path);

    if (!File::exists($path)) {
        abort(404);
    }

    return response()->file($path);
})->where('path', '.*');

// Serve React app for all other routes
Route::get('/{any?}', function () {
    $htmlPath = public_path('index.html');

    if (!File::exists($htmlPath)) {
        return response('Frontend not found. Please build React app.', 500);
    }

    return response()->file($htmlPath);
})->where('any', '^(?!api|storage).*$');
