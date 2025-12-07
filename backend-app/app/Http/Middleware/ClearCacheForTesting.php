<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ClearCacheForTesting
{
    public function handle($request, Closure $next)
    {

        if (!$this->shouldRun()) {
            return $next($request);
        }

        if (env('CLEAR_CACHE_EACH_REQUEST', false)) {
            Cache::flush();
            Log::debug('Cache flushed completely');
        }

        return $next($request);
    }

    protected function shouldRun()
    {
        // Условия, при которых middleware должен работать
        return app()->isLocal() ||
            app()->runningUnitTests() ||
            config('app.debug') ||
            request()->has('force_dev_mode');
    }
}
