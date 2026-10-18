<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class PrivateApiResponses
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        if ($request->is('api/*', 'auth/*', 'register-fcm-token.php')) {
            $response->headers->set('Cache-Control', 'private, no-store');
        }

        return $response;
    }
}
