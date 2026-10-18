<?php

namespace App\Jobs;

use App\Services\FirebaseClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class SendPushNotification implements ShouldQueue
{
    use Queueable;

    public int $tries = 4;

    public int $timeout = 120;

    public function __construct(public int $notificationId) {}

    public function backoff(): array
    {
        return [30, 120, 600];
    }

    public function handle(FirebaseClient $firebase): void
    {
        $n = DB::table('notifications')->find($this->notificationId);
        if (! $n) {
            return;
        }
        $tokens = DB::table('device_tokens')->where('user_id', $n->user_id)->where('active', true)->get();
        $failed = false;
        foreach ($tokens as $token) {
            DB::table('push_deliveries')->insertOrIgnore(['notification_id' => $n->id, 'device_token_id' => $token->id, 'status' => 'pending', 'created_at' => now(), 'updated_at' => now()]);
            $error = null;
            DB::transaction(function () use ($n, $token, $firebase, &$error) {
                $q = DB::table('push_deliveries')->where('notification_id', $n->id)->where('device_token_id', $token->id);
                $delivery = (clone $q)->lockForUpdate()->first();
                if (in_array($delivery->status, ['sent', 'invalid'], true)) {
                    return;
                }
                try {
                    $firebase->send($token->token, $n);
                    $q->update(['status' => 'sent', 'attempts' => $delivery->attempts + 1, 'sent_at' => now(), 'last_error' => null, 'updated_at' => now()]);
                } catch (\DomainException $e) {
                    DB::table('device_tokens')->where('id', $token->id)->update(['active' => false, 'updated_at' => now()]);
                    $q->update(['status' => 'invalid', 'attempts' => $delivery->attempts + 1, 'last_error' => 'Unregistered device token.', 'updated_at' => now()]);
                } catch (\Throwable $e) {
                    $q->update(['status' => 'failed', 'attempts' => $delivery->attempts + 1, 'last_error' => 'Push provider delivery failed; see restricted worker logs.', 'updated_at' => now()]);
                    $error = $e;
                }
            });
            if ($error) {
                report($error);
                $failed = true;
            }
        }
        if ($failed) {
            throw new \RuntimeException('One or more push deliveries failed.');
        }
    }
}
