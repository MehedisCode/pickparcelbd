<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', fn () => response()->json(['application' => 'PickParcelBD API', 'version' => '1.0', 'frontend' => config('pickparcel.frontend_url')]));
Route::get('auth/google', [AuthController::class, 'redirect'])->middleware('throttle:10,1')->name('login');
Route::get('auth/google/callback', [AuthController::class, 'callback']);
Route::post('auth/preview', [AuthController::class, 'preview'])->middleware('throttle:10,1');
Route::post('auth/logout', [AuthController::class, 'logout']);
Route::get('google-login.php', [AuthController::class, 'redirect']);
Route::get('google-callback.php', [AuthController::class, 'callback']);
Route::get('media/public/{path}', function (string $path) {
    abort_if(str_contains($path, '..') || str_starts_with($path, '/'), 404);
    abort_unless(preg_match('~^(products|profiles)/[A-Za-z0-9_.-]+\.(jpg|jpeg|png|webp)$~i', $path), 404);
    abort_unless(Storage::disk('public')->exists($path), 404);

    return response()->file(Storage::disk('public')->path($path), ['X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'public, max-age=86400']);
})->where('path', '.*');
require __DIR__.'/compatibility.php';
