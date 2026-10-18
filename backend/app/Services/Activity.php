<?php

namespace App\Services;

use App\Jobs\SendPushNotification;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class Activity
{
    public function audit(User $actor, string $action, string $type, string|int $id, mixed $before = null, mixed $after = null, ?string $reason = null): void
    {
        DB::table('audit_logs')->insert(['actor_id' => $actor->id, 'action' => $action, 'resource_type' => $type, 'resource_id' => (string) $id, 'district' => $actor->district, 'before' => $before === null ? null : json_encode($before), 'after' => $after === null ? null : json_encode($after), 'reason' => $reason, 'created_at' => now()]);
    }

    public function notify(int $userId, string $type, string $title, string $body, ?string $url = null, ?int $senderId = null): void
    {
        $id = DB::table('notifications')->insertGetId(['user_id' => $userId, 'sender_id' => $senderId, 'type' => $type, 'title' => $title, 'body' => $body, 'url' => $url, 'created_at' => now(), 'updated_at' => now()]);
        SendPushNotification::dispatch($id)->afterCommit();
    }

    public function event(int $parcelId, ?int $actorId, string $type, string $note, array $metadata = []): void
    {
        if (in_array($type, ['verify-pickup', 'handover', 'verify-delivery'], true)) {
            $ids = array_filter([$actorId, $metadata['from_user_id'] ?? null, $metadata['to_user_id'] ?? null]);
            $metadata['handlers'] = User::whereIn('id', $ids)->whereIn('role', config('pickparcel.member_roles'))->get(['id', 'role', 'district'])->toArray();
        }
        DB::table('parcel_events')->insert(['parcel_id' => $parcelId, 'actor_id' => $actorId, 'type' => $type, 'note' => $note, 'metadata' => json_encode($metadata), 'created_at' => now()]);
    }
}
