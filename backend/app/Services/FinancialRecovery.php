<?php

namespace App\Services;

use App\Models\User;
use App\Support\Access;
use App\Support\Money;
use Illuminate\Support\Facades\DB;

class FinancialRecovery
{
    public function __construct(private ParcelService $parcels, private FinanceService $finance, private Activity $activity) {}

    public function repair(User $admin, string $code, string $action, string $reason, ?int $userId): void
    {
        Access::admin($admin);
        DB::transaction(function () use ($admin, $code, $action, $reason, $userId) {
            $p = $this->parcels->find($admin, $code, true);
            Access::district($admin, $p->pickup_district);
            $before = (array) $p;
            if ($action === 'repair-member-credit') {
                $commission = DB::table('commissions')->where('parcel_id', $p->id)->where('district', $admin->district)->lockForUpdate()->first() ?? abort(409, 'A recorded commission is required.');
                $allocation = DB::table('commission_participants')->where('commission_id', $commission->id)->where('user_id', $userId)->lockForUpdate()->first() ?? abort(422, 'No allocation exists for this member.');
                abort_unless($allocation->settled_at, 409, 'Settle the unpaid commission through the ordinary settlement flow.');
                $item = DB::table('settlement_items')->join('settlements', 'settlements.id', '=', 'settlement_items.settlement_id')->where('parcel_id', $p->id)->where('beneficiary_id', $userId)->where('settlement_items.type', 'member')->where('settlements.district', $admin->district)->select('settlement_items.*')->first() ?? abort(409, 'A recorded settlement item is required.');
                abort_unless(bccomp((string) $item->amount, (string) $allocation->amount, 2) === 0, 409, 'Recorded settlement and allocation amounts differ.');
                $this->finance->credit($admin, $userId, $p->id, (string) $item->amount, 'commission_credit', $item->operation_key, $item->settlement_id);
            } elseif ($action === 'reconcile-delivery') {
                abort_unless($p->status === 'delivered' && $p->collection_status === 'pending', 409, 'Only a delivered parcel awaiting collection can be reconciled.');
                $event = DB::table('parcel_events')->where('parcel_id', $p->id)->where('type', 'verify-delivery')->orderByDesc('id')->first() ?? abort(409, 'Verified delivery history is required.');
                abort_if(DB::table('commissions')->where('parcel_id', $p->id)->exists() || DB::table('wallet_transactions')->where('parcel_id', $p->id)->where('type', 'parcel_delivery_credit')->exists(), 409, 'Existing financial history requires manual reconciliation.');
                DB::table('parcels')->where('id', $p->id)->update(['collected_amount' => Money::add((string) $p->delivery_charge, $p->cod_enabled ? (string) $p->cod_amount : '0.00'), 'delivered_at' => $p->delivered_at ?: $event->created_at, 'updated_at' => now()]);
            } elseif ($action === 'repair-return-request') {
                abort_unless($p->picked_up_at && ! in_array($p->status, ['delivered', 'returned'], true), 409, 'Verified pickup and an active parcel are required.');
                $return = DB::table('parcel_returns')->where('parcel_id', $p->id)->where('status', 'pending')->lockForUpdate()->first() ?? abort(409, 'A pending return request is required.');
                $member = User::find($return->member_id);
                abort_unless($member && $member->isMember(), 409, 'The recorded returning member is not currently eligible.');
                abort_unless((int) $p->holder_id === $member->id || (! $p->holder_id && (int) $p->assigned_member_id === $member->id), 409, 'Current custody conflicts with the return record.');
                abort_if(DB::table('transfer_items')->join('transfers', 'transfers.id', '=', 'transfer_items.transfer_id')->where('parcel_id', $p->id)->where('transfers.status', 'pending')->where('expires_at', '>', now())->exists(), 409, 'Resolve the pending handover first.');
                DB::table('parcels')->where('id', $p->id)->update(['status' => 'return_pending', 'holder_id' => $member->id, 'custody_bucket' => 'return_pending', 'updated_at' => now()]);
            } elseif ($action === 'repair-return') {
                abort_if($p->status === 'delivered' || $p->delivered_at, 409, 'Delivered parcel history cannot be overwritten by return recovery.');
                $return = DB::table('parcel_returns')->where('parcel_id', $p->id)->where('status', 'accepted')->lockForUpdate()->first() ?? abort(409, 'A sender-accepted return receipt is required.');
                abort_unless((int) $return->accepted_by === (int) $p->sender_id && $return->accepted_at, 409, 'Sender physical receipt has not been established.');
                abort_if(DB::table('commissions')->where('parcel_id', $p->id)->exists() || DB::table('wallet_transactions')->where('parcel_id', $p->id)->where('type', 'parcel_delivery_credit')->exists(), 409, 'Financial credits must be reconciled before return recovery.');
                $ids = DB::table('transfer_items')->where('parcel_id', $p->id)->pluck('transfer_id');
                DB::table('transfers')->whereIn('id', $ids)->where('status', 'pending')->update(['status' => 'cancelled', 'updated_at' => now()]);
                DB::table('parcels')->where('id', $p->id)->update(['status' => 'returned', 'custody_bucket' => 'returned', 'holder_id' => $p->sender_id, 'returned_at' => $return->accepted_at, 'collection_status' => $return->company_received_at ? 'return_received' : 'pending', 'updated_at' => now()]);
            } else {
                abort(404);
            }
            $this->activity->audit($admin,$action,'parcel',$p->id,$before,(array) DB::table('parcels')->find($p->id),$reason);
            $this->activity->event($p->id,$admin->id,$action,$reason,['beneficiary_id' => $userId]);
        }, 3);
    }
}
