<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\LogFrontendRequests;
use App\Http\Middleware\CheckRole;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
        // $middleware->append(LogFrontendRequests::class);

        // use in development MODE
        $middleware->append(\App\Http\Middleware\ServiceMetricsMiddleware::class);
        $middleware->append(\App\Http\Middleware\ClearCacheForTesting::class);

        $middleware->alias(['role' => CheckRole::class]);
        // $middleware->append(CheckRole::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
