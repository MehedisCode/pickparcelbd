<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function session(Request $r)
    {
        $user = Auth::guard('web')->user();

        return response()->json(['user' => $user, 'profile_complete' => $user?->profileComplete() ?? false, 'preview_available' => app()->environment('local') && config('pickparcel.preview_login')]);
    }

    public function redirect(Request $r)
    {
        abort_unless(config('services.google.client_id'), 503, 'Google sign-in is not configured yet.');
        $return = (string) $r->query('return', '/dashboard');
        if (! str_starts_with($return, '/') || str_starts_with($return, '//') || preg_match('/[\\\\\r\n]/', $return)) {
            $return = '/dashboard';
        }
        $r->session()->put('login_return', $return);

        return Socialite::driver('google')->scopes(['openid', 'email', 'profile'])->redirect();
    }

    public function callback(Request $r)
    {
        $google = Socialite::driver('google')->user();
        abort_unless(($google->user['email_verified'] ?? $google->user['verified_email'] ?? false) && $google->getEmail(), 403, 'A verified Google email is required.');
        $u = User::where('google_id', $google->getId())->first() ?? User::where('email', $google->getEmail())->first();
        if ($u?->google_id) {
            abort_unless(hash_equals((string) $u->google_id, (string) $google->getId()), 403, 'This email is linked to a different Google identity.');
        }
        if (! $u) {
            do {
                $public = 'PP'.random_int(1000000000, 9999999999);
            } while (User::where('public_id', $public)->exists());
            $u = new User;
            $u->forceFill(['public_id' => $public, 'email' => $google->getEmail(), 'role' => 'customer', 'wallet_balance' => '0.00']);
        }
        $u->forceFill(['google_id' => $google->getId(), 'name' => $google->getName() ?: $google->getNickname() ?: 'PickParcel user', 'avatar_url' => $google->getAvatar()])->save();
        Auth::login($u, true);
        $r->session()->regenerate();
        $return = $r->session()->pull('login_return', '/dashboard');

        return redirect(rtrim(config('pickparcel.frontend_url'), '/').($u->profileComplete() ? $return : '/complete-profile'));
    }

    public function preview(Request $r)
    {
        abort_unless(app()->environment('local') && config('pickparcel.preview_login'), 404);
        $data = $r->validate(['email' => 'required|email']);
        abort_unless(str_ends_with($data['email'], '@preview.example'), 403);
        $u = User::where('email', $data['email'])->firstOrFail();
        Auth::login($u);
        $r->session()->regenerate();

        return response()->json(['user' => $u]);
    }

    public function logout(Request $r)
    {
        if ($r->user()) {
            $r->user()->forceFill(['online' => false])->save();
        }
        Auth::guard('web')->logout();
        $r->session()->invalidate();
        $r->session()->regenerateToken();

        return response()->json(['message' => 'Signed out.']);
    }
}
