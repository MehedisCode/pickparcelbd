<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Database\Query\Builder;

final class Access
{
    public static function admin(User $user): void
    {
        abort_unless($user->isAdmin() && filled($user->district), 403, 'District administrator access required.');
    }

    public static function member(User $user): void
    {
        abort_unless($user->isMember(), 403, 'Rider or agent access required.');
    }

    public static function district(User $user, ?string $district): void
    {
        self::admin($user);
        abort_unless(strcasecmp(trim($user->district), trim((string) $district)) === 0, 403, 'This record is outside your district.');
    }

    public static function parcels(Builder $q, User $u): Builder
    {
        if ($u->isAdmin()) {
            return $q->where('pickup_district', $u->district);
        }

        return $q->where(function (Builder $q) use ($u) {
            $q->where('sender_id', $u->id)->orWhere('recipient_id', $u->id)->orWhere('assigned_member_id', $u->id)->orWhere('holder_id', $u->id);
            if ($u->isMember()) {
                $q->orWhereExists(function (Builder $events) use ($u) {
                    $events->selectRaw('1')->from('parcel_events')->whereColumn('parcel_events.parcel_id', 'parcels.id')->where('actor_id', $u->id)->whereIn('type', ['verify-pickup', 'handover', 'verify-delivery']);
                });
            }
            if ($u->isMember()) {
                $q->orWhere(fn (Builder $p) => $p->where('status', 'pending')->whereNull('assigned_member_id')->where('pickup_district', $u->district));
            }
        });
    }
}
