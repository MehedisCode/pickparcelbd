<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;

class Geocoding
{
    public function reverse(float $latitude, float $longitude): array
    {
        abort_unless(config('pickparcel.geocoding_enabled'), 503, 'Address lookup is not configured in this environment.');
        $key = 'geo.reverse.'.hash('sha256', round($latitude, 5).','.round($longitude, 5));
        if ($cached = Cache::get($key)) {
            return $cached;
        }
        $lock = Cache::lock('geo.provider', 15);
        abort_unless($lock->get(), 429, 'Address lookup is busy. Try again shortly.');
        try {
            abort_if(RateLimiter::tooManyAttempts('geo.provider.rate', 1), 429, 'Please wait before another address lookup.');
            RateLimiter::hit('geo.provider.rate', 1);
            $response = Http::withHeaders(['User-Agent' => config('pickparcel.geocoding_user_agent'), 'Accept-Language' => 'bn,en'])->timeout(10)->get(rtrim(config('pickparcel.geocoding_url'), '/').'/reverse', ['format' => 'jsonv2', 'lat' => $latitude, 'lon' => $longitude, 'addressdetails' => 1, 'zoom' => 18]);
            abort_unless($response->successful() && $response->json('display_name'), 502, 'The address provider could not identify this location. Enter the address manually.');
            $result = ['display_name' => (string) $response->json('display_name'), 'attribution' => '© OpenStreetMap contributors', 'attribution_url' => 'https://www.openstreetmap.org/copyright'];
            Cache::put($key, $result, 86400);

            return $result;
        } finally {
            $lock->release();
        }
    }
}
