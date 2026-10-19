<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\GoogleAccounts;
use App\Support\AuthNavigation;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Throwable;

class AuthController extends Controller
{
    public function session(Request $r)
    {
        $user = Auth::guard('web')->user();

        return response()->json([
            'user' => $user,
            'profile_complete' => $user?->profileComplete() ?? false,
            'preview_available' => $this->previewAllowed(),
        ]);
    }

    public function redirect(Request $r)
    {
        $r->session()->put('login_return', AuthNavigation::path($r->query('return'), ''));
        if (! AuthNavigation::configured()) {
            return $this->failure($r, 'unavailable');
        }

        return Socialite::driver('google')->scopes(['openid', 'email', 'profile'])->with(['prompt' => 'select_account'])->redirect();
    }

    public function callback(Request $r, GoogleAccounts $accounts)
    {
        if ($r->has('error')) {
            return $this->failure($r, $r->query('error') === 'access_denied' ? 'cancelled' : 'failed');
        }
        if (! AuthNavigation::configured()) {
            return $this->failure($r, 'unavailable');
        }
        if (! is_string($r->query('code')) || ! $r->query('code') || ! is_string($r->query('state')) || ! $r->query('state')) {
            return $this->failure($r, 'expired');
        }
        try {
            $google = Socialite::driver('google')->user();
        } catch (InvalidStateException) {
            return $this->failure($r, 'expired');
        } catch (Throwable $exception) {
            // Provider exception messages may contain tokens, codes or secrets.
            Log::warning('Google sign-in provider request failed.', ['exception_class' => $exception::class]);

            return $this->failure($r, 'failed');
        }
        if (filter_var($google->user['email_verified'] ?? $google->user['verified_email'] ?? false, FILTER_VALIDATE_BOOLEAN) !== true || ! filter_var($google->getEmail(), FILTER_VALIDATE_EMAIL) || strlen((string) $google->getEmail()) > 320 || ! $google->getId()) {
            return $this->failure($r, 'unverified');
        }
        try {
            $u = $accounts->resolve($google);
        } catch (DomainException) {
            return $this->failure($r, 'account_conflict');
        } catch (Throwable $exception) {
            Log::warning('Google sign-in account persistence failed.', ['exception_class' => $exception::class]);

            return $this->failure($r, 'failed');
        }
        Auth::login($u, true);
        $r->session()->regenerate();
        $return = AuthNavigation::path($r->session()->pull('login_return'), AuthNavigation::home($u));

        return redirect(rtrim(config('pickparcel.frontend_url'), '/').($u->profileComplete() ? $return : '/complete-profile?'.http_build_query(['return' => $return])));
    }

    private function failure(Request $r, string $error)
    {
        $return = AuthNavigation::path($r->session()->pull('login_return'), '');
        $r->session()->forget(['state', 'code_verifier']);
        $query = ['error' => $error];
        if ($return !== '') {
            $query['return'] = $return;
        }

        return redirect(rtrim(config('pickparcel.frontend_url'), '/').'/login?'.http_build_query($query));
    }

    public function preview(Request $r)
    {
        abort_unless($this->previewAllowed(), 404);
        $data = $r->validate(['email' => 'required|email']);
        abort_unless(str_ends_with($data['email'], '@preview.example'), 403);
        $u = User::where('email', $data['email'])->firstOrFail();
        Auth::login($u);
        $r->session()->regenerate();

        return response()->json(['user' => $u]);
    }

    private function previewAllowed(): bool
    {
        return app()->environment('local', 'staging') || (bool) config('pickparcel.preview_login');
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
