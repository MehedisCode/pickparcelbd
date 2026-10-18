<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class FirebaseClient
{
    public function send(string $token, object $notification): void
    {
        $path = config('pickparcel.firebase_credentials');
        if (! $path || ! is_file($path)) {
            throw new \RuntimeException('Firebase service account is not configured.');
        }
        $credentials = json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        foreach (['client_email', 'private_key', 'project_id'] as $key) {
            if (empty($credentials[$key])) {
                throw new \RuntimeException('Firebase service account is incomplete.');
            }
        }
        $access = Cache::remember('firebase.access.'.hash('sha256', $credentials['client_email']), 3000, function () use ($credentials) {
            $jwt = JWT::encode(['iss' => $credentials['client_email'], 'scope' => 'https://www.googleapis.com/auth/firebase.messaging', 'aud' => 'https://oauth2.googleapis.com/token', 'iat' => time(), 'exp' => time() + 3600], $credentials['private_key'], 'RS256');

            return Http::asForm()->timeout(15)->post('https://oauth2.googleapis.com/token', ['grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer', 'assertion' => $jwt])->throw()->json('access_token');
        });
        $project = rawurlencode($credentials['project_id']);
        $senderImage = $notification->sender_id ? DB::table('users')->where('id', $notification->sender_id)->value('avatar_url') : null;
        // Preserve the existing APK's data-only contract; the app constructs
        // its notification from title/body/sender_image even in background.
        $response = Http::withToken($access)->timeout(15)->post('https://fcm.googleapis.com/v1/projects/'.$project.'/messages:send', ['message' => ['token' => $token, 'android' => ['priority' => 'HIGH'], 'data' => ['notification_id' => (string) $notification->id, 'title' => (string) $notification->title, 'body' => (string) $notification->body, 'sender_image' => (string) ($senderImage ?? ''), 'type' => (string) $notification->type, 'url' => (string) ($notification->url ?? '/dashboard/notifications')]]]);
        if ($response->status() === 404 && str_contains($response->body(), 'UNREGISTERED')) {
            throw new \DomainException('Device token is no longer registered.');
        }
        $response->throw();
    }
}
