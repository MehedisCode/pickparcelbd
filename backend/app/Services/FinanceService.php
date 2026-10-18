<?php

namespace App\Services;

use App\Models\User;
use App\Support\Access;
use App\Support\Money;
use Illuminate\Support\Facades\DB;

class FinanceService
{
    public function __construct(private Activity $activity, private ParcelService $parcels) {}

    public function credit(User $admin, int $userId, int $parcelId, string $amount, string $type, string $key, ?int $settlementId = null): int
    {
        // Caller must own a transaction and lock the parcel before the user wallet.
        $owner = DB::table('users')->where('id', $userId)->lockForUpdate()->first() ?? abort(422, 'Wallet owner not found.');
        $old = DB::table('wallet_transactions')->where('operation_key', $key)->first();
        if ($old) {
            abort_unless((int) $old->user_id === $userId && (int) $old->parcel_id === $parcelId && $old->type === $type, 409, 'Existing operation belongs to a different ledger record.');
            abort_unless(bccomp((string) $old->amount, $amount, 2) === 0, 409, 'Existing credit differs from the requested amount.');

            return $old->id;
        }
        $balance = Money::add((string) $owner->wallet_balance, $amount);
        DB::table('users')->where('id', $userId)->update(['wallet_balance' => $balance, 'updated_at' => now()]);

        return DB::table('wallet_transactions')->insertGetId(['user_id' => $userId, 'parcel_id' => $parcelId, 'settlement_id' => $settlementId, 'created_by' => $admin->id, 'amount' => $amount, 'balance_after' => $balance, 'type' => $type, 'operation_key' => $key, 'note' => 'Confirmed by '.$admin->name, 'created_at' => now()]);
    }

    public function parcelCommand(User $admin, string $code, string $action): void
    {
        Access::admin($admin);
        DB::transaction(function () use ($admin, $code, $action) {
            $p = $this->parcels->find($admin, $code, true);
            Access::district($admin, $p->pickup_district);
            switch ($action) {
                case 'receive-collection':
                    abort_unless($p->status === 'delivered', 409, 'Parcel must be delivered first.');
                    abort_unless($p->collection_status === 'pending', 409, 'Collection has already been received.');
                    DB::table('parcels')->where('id', $p->id)->update(['collection_status' => 'received', 'updated_at' => now()]);
                    break;
                case 'confirm-wallet':
                    abort_unless($p->status === 'delivered' && $p->collection_status === 'received', 409, 'Receive the delivered parcel collection first.');
                    $this->credit($admin, $p->sender_id, $p->id, $p->cod_enabled ? (string) $p->cod_amount : '0.00', 'parcel_delivery_credit', 'delivery:'.$p->id.':'.$p->sender_id);
                    break;
                case 'receive-return':
                    abort_unless($p->status === 'returned', 409, 'Sender must accept the returned parcel first.');
                    abort_unless($p->collection_status !== 'return_received', 409, 'Return receipt is already confirmed.');
                    $return = DB::table('parcel_returns')->where('parcel_id', $p->id)->where('status', 'accepted')->lockForUpdate()->first() ?? abort(409, 'Accepted return receipt is missing.');
                    DB::table('parcel_returns')->where('id', $return->id)->update(['company_received_at' => now(), 'received_by' => $admin->id, 'updated_at' => now()]);
                    DB::table('parcels')->where('id', $p->id)->update(['collection_status' => 'return_received', 'updated_at' => now()]);
                    break;
                case 'calculate-commission':
                    abort_unless($p->status === 'delivered' && $p->collection_status === 'received', 409, 'Delivery and received collection are required.');
                    abort_if(DB::table('commissions')->where('parcel_id', $p->id)->exists(), 409, 'Commission already calculated.');
                    $rule = DB::table('commission_rules')->where('district', $p->pickup_district)->first() ?? abort(422, 'Set a commission rule for this district first.');
                    $events = DB::table('parcel_events')->where('parcel_id', $p->id)->whereIn('type', ['verify-pickup', 'handover', 'verify-delivery'])->orderBy('id')->get();
                    $handlers = [];
                    foreach ($events as $e) {
                        $meta = json_decode($e->metadata ?? '{}', true);
                        if (array_key_exists('handlers', $meta)) {
                            foreach ($meta['handlers'] as $handler) {
                                $handlers[(int) $handler['id']] = $handler;
                            }
                        } else {
                            foreach (array_filter([$e->actor_id, $meta['from_user_id'] ?? null, $meta['to_user_id'] ?? null]) as $id) {
                                $member = User::find($id);
                                if ($member?->isMember()) {
                                    $handlers[$member->id] = $member->only(['id', 'role', 'district']);
                                }
                            }
                        }
                    }
                    abort_unless(count($handlers) > 0, 422, 'No verified parcel handlers found.');
                    foreach ($handlers as $handler) {
                        abort_unless($handler['district'] === $admin->district, 422, 'A parcel handler worked outside this district.');
                    }
                    $ids = array_keys($handlers);
                    $participants = User::whereIn('id', $ids)->get()->sortBy(fn ($member) => array_search($member->id, $ids))->values();
                    abort_unless($participants->count() === count($handlers), 422, 'A historical handler account is missing.');
                    $pool = Money::percent((string) $p->delivery_charge, Money::add((string) $rule->rider_percent, (string) $rule->agent_percent));
                    $company = Money::sub((string) $p->delivery_charge, $pool);
                    $cid = DB::table('commissions')->insertGetId(['parcel_id' => $p->id, 'district' => $p->pickup_district, 'delivery_charge' => $p->delivery_charge, 'member_amount' => $pool, 'company_amount' => $company, 'created_at' => now(), 'updated_at' => now()]);
                    // Allocate whole minor units; the final participant receives the remainder.
                    $base = bcdiv($pool, (string) $participants->count(), 2);
                    $allocated = '0.00';
                    foreach ($participants as $i => $member) {
                        $amount = $i === $participants->count() - 1 ? Money::sub($pool, $allocated) : $base;
                        $allocated = Money::add($allocated, $amount);
                        DB::table('commission_participants')->insert(['commission_id' => $cid, 'user_id' => $member->id, 'amount' => $amount]);
                    }break;
                default:abort(404, 'Unknown financial operation.');
            }
            $this->activity->audit($admin, $action, 'parcel', $p->id, (array) $p, (array) DB::table('parcels')->find($p->id));
            $this->activity->event($p->id, $admin->id, $action, ucwords(str_replace('-', ' ', $action)));
        }, 3);
    }

    public function settle(User $admin, string $type, ?int $userId, ?string $note): int
    {
        Access::admin($admin);

        return DB::transaction(function () use ($admin, $type, $userId, $note) {
            // All settlements for a district share this lock and deterministic item ordering.
            DB::table('users')->where('id', $admin->id)->lockForUpdate()->first();
            $q = DB::table('commissions')->where('district', $admin->district);
            if ($type === 'member') {
                $member = User::findOrFail($userId);
                // Entitlement belongs to the historical commission district, even after a member changes role or address.
                $rows = DB::table('commission_participants')->join('commissions', 'commissions.id', '=', 'commission_participants.commission_id')->where('commissions.district', $admin->district)->where('user_id', $userId)->whereNull('settled_at')->select('commission_participants.id', 'commission_participants.amount', 'commissions.parcel_id')->orderBy('commission_participants.id')->lockForUpdate()->get();
            } else {
                $rows = $q->whereNull('company_settled_at')->select('id', 'parcel_id', 'company_amount as amount')->orderBy('id')->lockForUpdate()->get();
            }
            abort_unless($rows->isNotEmpty(), 409, 'No unpaid commission items found.');
            $total = '0.00';
            foreach ($rows as $row) {
                $total = Money::add($total, (string) $row->amount);
            }
            $sid = DB::table('settlements')->insertGetId(['reference' => 'ST'.strtoupper(bin2hex(random_bytes(8))), 'type' => $type, 'user_id' => $type === 'member' ? $userId : null, 'created_by' => $admin->id, 'district' => $admin->district, 'amount' => $total, 'note' => $note, 'created_at' => now(), 'updated_at' => now()]);
            foreach ($rows as $row) {
                $key = 'commission:'.$type.':'.$row->parcel_id.':'.($type === 'member' ? $userId : 'company');
                DB::table('settlement_items')->insert(['settlement_id' => $sid, 'parcel_id' => $row->parcel_id, 'beneficiary_id' => $type === 'member' ? $userId : null, 'type' => $type, 'amount' => $row->amount, 'operation_key' => $key]);
                if ($type === 'member') {
                    $this->credit($admin, $userId, $row->parcel_id, (string) $row->amount, 'commission_credit', $key, $sid);
                    DB::table('commission_participants')->where('id', $row->id)->update(['settled_at' => now()]);
                } else {
                    DB::table('commissions')->where('id', $row->id)->update(['company_settled_at' => now(), 'updated_at' => now()]);
                }
            }
            $this->activity->audit($admin, 'commission_settled', 'settlement', $sid, null, ['amount' => $total, 'type' => $type, 'user_id' => $userId], $note);

            return $sid;
        }, 3);
    }
}
