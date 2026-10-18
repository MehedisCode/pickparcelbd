<?php

use App\Http\Controllers\CommunicationController;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/product.php', fn (Request $r) => redirect(config('pickparcel.frontend_url').'/products/'.(int) $r->query('id'), 301));
Route::get('/public-profile.php', fn (Request $r) => redirect(config('pickparcel.frontend_url').'/sellers/'.rawurlencode((string) $r->query('id')), 301));
Route::get('/user.php', fn (Request $r) => redirect(config('pickparcel.frontend_url').'/sellers/'.rawurlencode((string) $r->query('id')), 301));
Route::get('/ride-share.php', fn () => redirect(config('pickparcel.frontend_url').'/ride-share', 301));
Route::get('/help_support.php', fn () => redirect(config('pickparcel.frontend_url').'/help', 301));
Route::get('/terms-and-conditions.php', fn () => redirect(config('pickparcel.frontend_url').'/terms', 301));
Route::get('/complete-profile.php', fn () => redirect(config('pickparcel.frontend_url').'/complete-profile'));
Route::get('/superadmin.php', fn () => redirect(config('pickparcel.frontend_url').'/admin'));
Route::get('/rider_agent_management.php', fn () => redirect(config('pickparcel.frontend_url').'/operations'));
Route::get('/logout.php', fn () => redirect(config('pickparcel.frontend_url').'/dashboard/settings'));
Route::get('/index.php', function (Request $r) {
    $params = $r->only(['product', 'seller', 'id', 'tracking', 'cash_memo', 'cash_memo_id', 'section']);

    return redirect(rtrim(config('pickparcel.frontend_url'), '/').($params ? '/?'.http_build_query($params) : '/dashboard'));
});
// The existing Android WebView posts JSON without an XSRF header. This one
// endpoint requires a logged-in web session and an exact configured origin.
Route::post('/register-fcm-token.php', function (Request $r, CommunicationController $controller) {
    $url = parse_url(config('pickparcel.frontend_url'));
    $origin = ($url['scheme'] ?? 'https').'://'.($url['host'] ?? '').(isset($url['port']) ? ':'.$url['port'] : '');
    abort_unless(hash_equals($origin, (string) $r->header('Origin')), 403, 'Invalid origin.');

    return $controller->token($r);
})->middleware(['auth', 'throttle:20,1'])->withoutMiddleware(PreventRequestForgery::class);
