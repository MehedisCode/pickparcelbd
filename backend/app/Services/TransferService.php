<?php

namespace App\Services;

use App\Models\User;
use App\Support\Access;
use App\Support\Money;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class TransferService
{
    public function __construct(private ParcelService $parcels, private Activity $activity) {}

    public function create(User $u, array $codes, ?string $note): array
    {
        Access::member($u);

        return DB::transaction(function () use ($u, $codes, $note) {
            $codes = array_unique($codes);
            sort($codes);
            $items = [];
            foreach ($codes as $code) {
                $p = $this->parcels->find($u, $code, true);
                abort_unless((int) $p->holder_id === $u->id, 403, 'You must hold each parcel.');
                abort_unless(in_array($p->status, ['picked_up', 'in_transit', 'out_for_delivery'], true), 409, 'Parcel is not eligible for handover. Resolve pending returns first.');
                $pending = DB::table('transfer_items')->join('transfers', 'transfers.id', '=', 'transfer_items.transfer_id')->where('parcel_id', $p->id)->where('transfers.status', 'pending')->where('expires_at', '>', now())->exists();
                abort_if($pending, 409, 'A parcel already has a pending transfer.');
                $items[] = $p;
            }
            $token = bin2hex(random_bytes(32));
            $code = 'TR'.strtoupper(bin2hex(random_bytes(5)));
            $id = DB::table('transfers')->insertGetId(['code' => $code, 'token_hash' => hash('sha256', $token), 'token_encrypted' => Crypt::encryptString($token), 'sender_id' => $u->id, 'status' => 'pending', 'note' => $note, 'expires_at' => now()->addMinutes(config('pickparcel.transfer_minutes')), 'created_at' => now(), 'updated_at' => now()]);
            foreach ($items as $p) {
                DB::table('transfer_items')->insert(['transfer_id' => $id, 'parcel_id' => $p->id, 'collection_amount' => Money::add((string) $p->delivery_charge, $p->cod_enabled ? (string) $p->cod_amount : '0.00')]);
            }
            $this->activity->audit($u, 'transfer_created', 'transfer', $id, null, ['codes' => $codes]);

            return ['id' => $id, 'code' => $code, 'token' => $token, 'expires_at' => now()->addMinutes(config('pickparcel.transfer_minutes'))->toIso8601String()];
        }, 3);
    }

    public function preview(User $u, string $token): array
    {
        Access::member($u);
        abort_unless(preg_match('/^[a-f0-9]{64}$/', $token), 422, 'Invalid transfer QR token.');
        $t = DB::table('transfers')->where('token_hash', hash('sha256', $token))->first() ?? abort(404);
        abort_unless($t->status === 'pending' && strtotime($t->expires_at) > time(), 409, 'Transfer has expired or already closed.');
        $items = DB::table('transfer_items')->join('parcels', 'parcels.id', '=', 'transfer_items.parcel_id')->where('transfer_id', $t->id)->get(['parcels.code', 'parcels.status', 'parcels.delivery_district', 'parcels.delivery_upazila', 'parcels.weight_grams']);

        return ['transfer' => ['id' => $t->id, 'code' => $t->code, 'expires_at' => $t->expires_at, 'sender_name' => User::find($t->sender_id)?->name, 'note' => $t->note], 'items' => $items];
    }

    public function accept(User $u, string $token, array $codes): int
    {
        Access::member($u);

        return DB::transaction(function () use ($u, $token, $codes) {
            $t = DB::table('transfers')->where('token_hash', hash('sha256', $token))->lockForUpdate()->first() ?? abort(404);
            abort_unless($t->status === 'pending' && strtotime($t->expires_at) > time(), 409, 'Transfer has expired or already closed.');
            abort_if((int) $t->sender_id === $u->id, 422, 'You cannot receive your own handover.');
            $all = DB::table('transfer_items')->where('transfer_id', $t->id)->pluck('parcel_id')->all();
            $items = DB::table('parcels')->whereIn('id', $all)->whereIn('code', array_unique($codes))->orderBy('id')->lockForUpdate()->get();
            abort_unless($items->count() === count(array_unique($codes)) && $items->count() > 0, 422, 'Select valid parcels from this transfer.');
            foreach ($items as $p) {
                abort_unless((int) $p->holder_id === (int) $t->sender_id, 409, 'Parcel holder changed.');
                abort_unless(in_array($p->status, ['picked_up', 'in_transit', 'out_for_delivery'], true), 409, 'Parcel is no longer eligible for handover.');
                DB::table('parcels')->where('id', $p->id)->update(['holder_id' => $u->id, 'custody_bucket' => 'custody', 'status' => $p->status === 'return_pending' ? 'return_pending' : 'in_transit', 'updated_at' => now()]);
                DB::table('transfer_items')->where('transfer_id', $t->id)->where('parcel_id', $p->id)->update(['received_at' => now()]);
                $this->activity->event($p->id, $u->id, 'handover', 'Parcel received by '.$u->name, ['from_user_id' => $t->sender_id, 'to_user_id' => $u->id, 'transfer_id' => $t->id]);
            }
            DB::table('transfers')->where('id', $t->id)->update(['status' => 'accepted', 'receiver_id' => $u->id, 'accepted_at' => now(), 'updated_at' => now()]);
            $this->activity->notify($t->sender_id, 'transfer_received', 'হস্তান্তর গ্রহণ করা হয়েছে', $items->count().' parcels received by '.$u->name, '/operations/transfers/'.$t->id, $u->id);

            return $t->id;
        }, 3);
    }

    public function expire(): int
    {
        return DB::table('transfers')->where('status', 'pending')->where('expires_at', '<=', now())->update(['status' => 'cancelled', 'updated_at' => now()]);
    }
}
