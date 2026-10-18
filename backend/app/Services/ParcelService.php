<?php

namespace App\Services;

use App\Models\User;
use App\Support\Access;
use App\Support\Money;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ParcelService
{
    public function __construct(private Activity $activity, private Pricing $pricing) {}

    public function find(User $u, string $code, bool $lock = false): object
    {
        $code = preg_replace('/^RFD/i', '', trim($code));
        abort_unless(preg_match('/^\d{5,6}$/', $code), 422, 'Invalid parcel code.');
        $q = Access::parcels(DB::table('parcels'), $u)->where('code', str_pad($code, 6, '0', STR_PAD_LEFT));
        if ($lock) {
            $q->lockForUpdate();
        }

        return $q->first() ?? abort(404, 'Parcel not found.');
    }

    public function create(User $u, array $data): object
    {
        abort_unless($u->profileComplete(), 422, 'Complete your phone and delivery address first.');

        return DB::transaction(function () use ($u, $data) {
            // Serialize generation and automatic assignment for a sender.
            DB::table('users')->where('id', $u->id)->lockForUpdate()->first();
            do {
                $code = (string) random_int(100000, 999999);
            } while (DB::table('parcels')->where('code', $code)->exists());
            $deliveryCode = (string) random_int(100000, 999999);
            $weight = (int) ($data['weight_grams'] ?? 1000);
            $record = array_merge([
                'code' => $code, 'sender_id' => $u->id, 'pickup_name' => $u->name, 'pickup_phone' => $u->phone, 'pickup_address' => $data['pickup_address'] ?? $u->address,
                'pickup_district' => $u->district, 'pickup_upazila' => $u->upazila, 'source' => 'direct', 'status' => 'pending',
                'weight_grams' => $weight, 'delivery_charge' => $this->pricing->delivery($weight), 'cod_enabled' => false, 'cod_amount' => '0.00',
                'delivery_district' => '', 'delivery_upazila' => '', 'created_at' => now(), 'updated_at' => now(),
            ], $data, ['code' => $code, 'sender_id' => $u->id, 'delivery_code_hash' => Hash::make($deliveryCode), 'delivery_code_encrypted' => Crypt::encryptString($deliveryCode)]);
            if (! $record['cod_enabled']) {
                $record['cod_amount'] = '0.00';
            }
            $id = DB::table('parcels')->insertGetId($record);
            $this->activity->event($id, $u->id, 'pending', 'Parcel booking created.');
            $active = DB::table('parcels')->where('sender_id', $u->id)->where('status', 'assigned')->whereNotNull('assigned_member_id')->orderByDesc('assigned_at')->first();
            if ($active) {
                DB::table('parcels')->where('id', $id)->update(['assigned_member_id' => $active->assigned_member_id, 'pickup_code_hash' => $active->pickup_code_hash, 'pickup_code_encrypted' => $active->pickup_code_encrypted, 'assigned_at' => now(), 'status' => 'assigned']);
                $this->activity->event($id, $u->id, 'assigned', 'Added to sender’s active pickup batch.');
            }
            $members = DB::table('users')->whereIn('role', config('pickparcel.member_roles'))->where('district', $u->district)->pluck('id');
            foreach ($members as $member) {
                $this->activity->notify($member, 'new_parcel', 'নতুন পার্সেল রিকোয়েস্ট', 'RFD'.$code.' pickup request from '.$u->name, '/operations', $u->id);
            }
            if (! empty($record['recipient_id'])) {
                $this->activity->notify((int) $record['recipient_id'], 'delivery_code', 'Delivery verification code', 'RFD'.$code.' delivery code: '.$deliveryCode, '/dashboard/parcels/'.$code, $u->id);
            }

            return DB::table('parcels')->find($id);
        }, 3);
    }

    public function assign(User $u, array $codes, int $memberId): void
    {
        DB::transaction(function () use ($u, $codes, $memberId) {
            $member = User::findOrFail($memberId);
            abort_unless($member->isMember(), 422, 'Select an active rider or agent.');
            DB::table('users')->where('id', $u->id)->lockForUpdate()->first();
            $otp = (string) random_int(100000, 999999);
            $hash = Hash::make($otp);
            $encrypted = Crypt::encryptString($otp);
            foreach (array_unique($codes) as $code) {
                $p = $this->find($u, $code, true);
                if ($u->isAdmin()) {
                    Access::district($u, $p->pickup_district);
                } else {
                    abort_unless((int) $p->sender_id === $u->id || ($u->isMember() && $memberId === $u->id && $p->pickup_district === $u->district), 403);
                }
                abort_unless(in_array($p->status, ['pending', 'assigned'], true) && ! $p->picked_up_at, 409, 'Parcel cannot be assigned at this stage.');
                abort_unless($member->district === $p->pickup_district, 422, 'Choose a member from the pickup district.');
                if ($p->assigned_member_id) {
                    abort_unless((int) $p->sender_id === $u->id || $u->isAdmin(), 409, 'Another member already accepted this parcel.');
                }
                DB::table('parcels')->where('id', $p->id)->update(['assigned_member_id' => $memberId, 'status' => 'assigned', 'assigned_at' => now(), 'pickup_code_hash' => $hash, 'pickup_code_encrypted' => $encrypted, 'updated_at' => now()]);
                $this->activity->event($p->id, $u->id, 'assigned', 'Assigned to '.$member->name, ['member_id' => $memberId]);
                $this->activity->notify($memberId, 'assignment', 'নতুন পিকআপ', 'RFD'.$p->code.' has been assigned to you.', '/operations', $u->id);
            }
        }, 3);
    }

    public function command(User $u, string $code, string $action, array $data): object
    {
        return DB::transaction(function () use ($u, $code, $action, $data) {
            $p = $this->find($u, $code, true);
            $change = [];
            $pendingTransfer = DB::table('transfer_items')->join('transfers', 'transfers.id', '=', 'transfer_items.transfer_id')->where('parcel_id', $p->id)->where('transfers.status', 'pending')->where('expires_at', '>', now())->exists();
            switch ($action) {
                case 'pickup-ready':
                    abort_unless((int) $p->sender_id === $u->id || (int) $p->assigned_member_id === $u->id, 403);
                    abort_unless(! $p->picked_up_at && in_array($p->status, ['pending', 'assigned'], true), 409);
                    $change = ['pickup_ready_at' => now()];
                    break;
                case 'list':
                    Access::member($u);
                    abort_unless((int) $p->holder_id === $u->id, 403);
                    abort_unless(in_array($p->status, ['picked_up', 'in_transit'], true) && ! $pendingTransfer, 409, 'This parcel cannot change lists at its current stage.');
                    $change = ['custody_bucket' => $data['bucket']];
                    break;
                case 'cancel-assignment':
                    abort_unless((int) $p->sender_id === $u->id || $u->isAdmin(), 403);
                    abort_unless($p->status === 'assigned' && ! $p->picked_up_at, 409, 'Pickup has already progressed.');
                    $change = ['status' => 'pending', 'assigned_member_id' => null, 'assigned_at' => null, 'pickup_code_hash' => null, 'pickup_code_encrypted' => null];
                    break;
                case 'verify-pickup':
                    Access::member($u);
                    abort_unless((int) $p->assigned_member_id === $u->id, 403);
                    abort_unless($p->status === 'assigned' && ! $p->picked_up_at, 409, 'Pickup is not available.');
                    abort_unless(Hash::check((string) ($data['code'] ?? ''), (string) $p->pickup_code_hash), 422, 'Incorrect pickup verification code.');
                    $change = ['status' => 'picked_up', 'custody_bucket' => 'pickup', 'picked_up_at' => now(), 'holder_id' => $u->id];
                    break;
                case 'verify-delivery':
                    Access::member($u);
                    abort_unless((int) $p->holder_id === $u->id, 403);
                    abort_unless($p->picked_up_at && ! in_array($p->status, ['delivered', 'returned', 'return_pending'], true) && ! $pendingTransfer, 409, 'Parcel cannot be delivered at this stage.');
                    abort_unless(! DB::table('parcel_returns')->where('parcel_id', $p->id)->where('status', 'pending')->exists(), 409, 'Resolve the pending return first.');
                    abort_unless(Hash::check((string) ($data['code'] ?? ''), (string) $p->delivery_code_hash), 422, 'Incorrect delivery verification code.');
                    $collected = Money::add((string) $p->delivery_charge, $p->cod_enabled ? (string) $p->cod_amount : '0.00');
                    $change = ['status' => 'delivered', 'custody_bucket' => 'delivered', 'delivered_at' => now(), 'collected_amount' => $collected];
                    break;
                case 'out-for-delivery':
                    Access::member($u);
                    abort_unless((int) $p->holder_id === $u->id, 403);
                    abort_unless(in_array($p->status, ['picked_up', 'in_transit'], true) && ! $pendingTransfer, 409, 'Parcel cannot leave for delivery.');
                    $change = ['status' => 'out_for_delivery', 'custody_bucket' => 'delivery'];
                    break;
                case 'weight':
                    Access::member($u);
                    abort_unless((int) $p->holder_id === $u->id || (int) $p->assigned_member_id === $u->id, 403);
                    abort_unless(! in_array($p->status, ['delivered', 'returned'], true), 409);
                    $grams = (int) $data['weight_grams'];
                    $charge = $this->pricing->delivery($grams);
                    $change = ['weight_grams' => $grams, 'delivery_charge' => $charge];
                    if ($p->order_id) {
                        DB::table('orders')->where('id', $p->order_id)->update(['delivery_charge' => $charge, 'total' => Money::add((string) DB::table('orders')->where('id', $p->order_id)->value('subtotal'), $charge), 'updated_at' => now()]);
                    }
                    break;
                case 'return-request':
                    abort_unless((int) $p->holder_id === $u->id || (int) $p->sender_id === $u->id, 403);
                    abort_unless($p->picked_up_at && ! in_array($p->status, ['delivered', 'returned', 'return_pending'], true) && ! $pendingTransfer, 409);
                    DB::table('parcel_returns')->insert(['parcel_id' => $p->id, 'requested_by' => $u->id, 'member_id' => $p->holder_id, 'accountability_amount' => Money::add((string) $p->delivery_charge, $p->cod_enabled ? (string) $p->cod_amount : '0.00'), 'status' => 'pending', 'reason' => $data['reason'], 'created_at' => now(), 'updated_at' => now()]);
                    $change = ['status' => 'return_pending', 'custody_bucket' => 'return_pending'];
                    break;
                case 'return-accept':
                    abort_unless((int) $p->sender_id === $u->id, 403);
                    abort_unless($p->status === 'return_pending' && ! $pendingTransfer, 409);
                    $return = DB::table('parcel_returns')->where('parcel_id', $p->id)->where('status', 'pending')->lockForUpdate()->first();
                    abort_unless($return, 409);
                    DB::table('parcel_returns')->where('id', $return->id)->update(['status' => 'accepted', 'accepted_by' => $u->id, 'accepted_at' => now(), 'updated_at' => now()]);
                    $change = ['status' => 'returned', 'custody_bucket' => 'returned', 'holder_id' => $u->id, 'returned_at' => now()];
                    break;
                case 'message':
                    DB::table('parcel_messages')->insert(['parcel_id' => $p->id, 'user_id' => $u->id, 'body' => $data['body'], 'created_at' => now(), 'updated_at' => now()]);
                    break;
                default: abort(404, 'Unknown parcel operation.');
            }
            if ($change) {
                DB::table('parcels')->where('id', $p->id)->update($change + ['updated_at' => now()]);
            }
            $this->activity->event($p->id, $u->id, $action, $data['reason'] ?? $data['body'] ?? ucwords(str_replace('-', ' ', $action)));
            if (in_array($action, ['cancel-assignment', 'pickup-ready'], true) && $p->assigned_member_id && (int) $p->assigned_member_id !== $u->id) {
                $this->activity->notify((int) $p->assigned_member_id, 'assignment_update', 'পিকআপ আপডেট', 'RFD'.$p->code.': '.ucwords(str_replace('-', ' ', $action)), '/operations/assignments', $u->id);
            }
            if ($p->recipient_id && (int) $p->recipient_id !== $u->id && (int) $p->recipient_id !== (int) $p->sender_id && in_array($action, ['verify-delivery', 'return-request', 'return-accept'], true)) {
                $this->activity->notify((int) $p->recipient_id, 'parcel_update', 'পার্সেল আপডেট', 'RFD'.$p->code.': '.($change['status'] ?? $action), '/dashboard/parcels/'.$p->code, $u->id);
            }
            if ((int) $p->sender_id !== $u->id) {
                $this->activity->notify($p->sender_id, 'parcel_update', 'পার্সেল আপডেট', 'RFD'.$p->code.': '.($change['status'] ?? $action), '/dashboard/parcels/'.$p->code, $u->id);
            }

            return DB::table('parcels')->find($p->id);
        }, 3);
    }

    public function serialize(object $p, ?User $u = null): array
    {
        $data = (array) $p;
        foreach (['pickup_code_hash', 'pickup_code_encrypted', 'delivery_code_hash', 'delivery_code_encrypted'] as $key) {
            unset($data[$key]);
        }
        $data['display_code'] = 'RFD'.$p->code;
        $data['total_collection'] = Money::add((string) $p->delivery_charge, $p->cod_enabled ? (string) $p->cod_amount : '0.00');

        return $data;
    }
}
