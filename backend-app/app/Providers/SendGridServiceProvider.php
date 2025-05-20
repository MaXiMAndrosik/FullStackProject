<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class SendGridServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register()
    {
        $this->app->bind('sendgrid', function () {
            return new \SendGrid(env('SENDGRID_API_KEY'));
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
