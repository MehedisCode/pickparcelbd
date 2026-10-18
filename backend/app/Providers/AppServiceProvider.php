<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('api', fn (Request $r) => Limit::perMinute(180)->by($r->user()?->id ?: $r->ip()));
        RateLimiter::for('tracking', fn (Request $r) => Limit::perMinute(20)->by($r->ip()));
        RateLimiter::for('verification', fn (Request $r) => Limit::perMinute(15)->by($r->user()?->id ?: $r->ip()));
    }
}
