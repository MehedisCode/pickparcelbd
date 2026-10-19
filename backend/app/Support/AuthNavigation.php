<?php

namespace App\Support;

use App\Models\User;

class AuthNavigation
{
    public static function configured(): bool
    {
        return filled(config('services.google.client_id')) && filled(config('services.google.client_secret')) && filled(config('services.google.redirect'));
    }

    public static function home(?User $user): string
    {
        return $user?->isAdmin() ? '/admin' : ($user?->isMember() ? '/operations' : '/dashboard');
    }

    public static function path(mixed $value, string $fallback = '/dashboard'): string
    {
        if (! is_string($value) || strlen($value) > 2048) {
            return $fallback;
        }
        foreach ([$value, rawurldecode($value)] as $candidate) {
            if (! str_starts_with($candidate, '/') || str_starts_with($candidate, '//') || preg_match('/[\x00-\x20\x7f\\\\]/', $candidate)) {
                return $fallback;
            }
        }
        $path = parse_url(rawurldecode($value), PHP_URL_PATH);
        if (! is_string($path) || preg_match('~(?:^|/)\.{1,2}(?:/|$)~', $path) || preg_match('~^/(?:auth(?:/|$)|login(?:/|$)|complete-profile(?:/|$)|google-(?:login|callback)\.php(?:/|$)|logout\.php(?:/|$))~i', $path)) {
            return $fallback;
        }

        return $value;
    }
}
