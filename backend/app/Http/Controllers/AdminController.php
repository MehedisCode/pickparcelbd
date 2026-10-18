<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\Activity;
use App\Services\ParcelService;
use App\Support\Access;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function users(Request $r)
    {
        Access::admin($r->user());
        $q = User::where('district', $r->user()->district);
        if ($r->filled('search')) {
            $s = (string) $r->query('search');
            $q->where(fn ($q) => $q->where('name', 'like', '%'.$s.'%')->orWhere('public_id', $s)->orWhere('phone', $s));
        }
        if ($r->boolean('members')) {
            $q->whereIn('role', config('pickparcel.member_roles'));
        }

        return response()->json($q->orderByDesc('id')->paginate(20));
    }

    public function updateUser(Request $r, int $id, Activity $activity)
    {
        Access::admin($r->user());
        $d = $r->validate(['role' => 'sometimes|required|in:customer,rider,union_agent,upazila_agent,district_agent', 'verified' => 'sometimes|boolean']);
        DB::transaction(function () use ($r, $id, $d, $activity) {
            $u = User::lockForUpdate()->findOrFail($id);
            Access::district($r->user(), $u->district);
            abort_if($u->isAdmin(), 403, 'Administrator roles cannot be modified here.');
            if (isset($d['role']) && $d['role'] === 'customer') {
                abort_if(DB::table('parcels')->where(fn ($q) => $q->where('holder_id', $id)->orWhere('assigned_member_id', $id))->whereNotIn('status', ['delivered', 'returned'])->exists(), 409, 'Resolve this member’s active assignments and custody first.');
            }
            $before = $u->only(['role', 'verified']);
            $u->forceFill($d + ['verified_by' => $r->user()->id])->save();
            $activity->audit($r->user(), 'member_updated', 'user', $id, $before, $d);
        });

        return response()->json(['message' => 'Member updated.']);
    }

    public function memberReport(Request $r, int $id)
    {
        $u = User::findOrFail($id);
        Access::district($r->user(), $u->district);
        $parcels = DB::table('parcels')->where('pickup_district', $r->user()->district)->where(fn ($q) => $q->where('holder_id', $id)->orWhere('assigned_member_id', $id)->orWhereExists(fn ($events) => $events->selectRaw('1')->from('parcel_events')->whereColumn('parcel_events.parcel_id', 'parcels.id')->where('actor_id', $id)->whereIn('type', ['verify-pickup', 'handover', 'verify-delivery'])))->get(['id', 'code', 'status', 'delivery_name', 'delivery_charge', 'collected_amount', 'collection_status', 'holder_id', 'assigned_member_id']);

        return response()->json(['user' => $u, 'parcels' => $parcels, 'commissions' => DB::table('commission_participants')->join('commissions', 'commissions.id', '=', 'commission_participants.commission_id')->where('user_id', $id)->where('district', $r->user()->district)->select('commission_participants.*')->get(), 'transactions' => DB::table('wallet_transactions')->where('user_id', $id)->orderByDesc('id')->limit(100)->get()]);
    }

    public function logs(Request $r)
    {
        Access::admin($r->user());

        return response()->json(DB::table('audit_logs')->leftJoin('users', 'users.id', '=', 'audit_logs.actor_id')->where('audit_logs.district', $r->user()->district)->select('audit_logs.*', 'users.name as actor_name')->orderByDesc('audit_logs.id')->paginate(30));
    }

    public function audits(Request $r)
    {
        Access::admin($r->user());

        return response()->json(['runs' => DB::table('audit_runs')->where('district', $r->user()->district)->orderByDesc('id')->limit(30)->get(), 'findings' => DB::table('audit_findings')->join('audit_runs', 'audit_runs.id', '=', 'audit_findings.audit_run_id')->leftJoin('parcels', 'parcels.id', '=', 'audit_findings.parcel_id')->where('audit_runs.district', $r->user()->district)->select('audit_findings.*', 'parcels.code')->orderByDesc('audit_findings.id')->limit(200)->get()]);
    }

    public function scan(Request $r, Activity $activity)
    {
        Access::admin($r->user());
        $d = $r->validate(['type' => 'required|in:financial,custody,returns,member_accountability,production_readiness']);
        $u = $r->user();
        $id = DB::transaction(function () use ($u, $d, $activity) {
            $run = DB::table('audit_runs')->insertGetId(['actor_id' => $u->id, 'type' => $d['type'], 'district' => $u->district, 'status' => 'completed', 'summary' => '{}', 'created_at' => now(), 'updated_at' => now()]);
            $findings = [];
            $parcels = DB::table('parcels')->where('pickup_district', $u->district)->orderBy('id')->get();
            foreach ($parcels as $p) {
                $add = function ($type, $severity, $details) use (&$findings, $p, $run) {
                    $findings[] = ['audit_run_id' => $run, 'parcel_id' => $p->id, 'type' => $type, 'severity' => $severity, 'details' => $details, 'status' => 'open', 'created_at' => now(), 'updated_at' => now()];
                };
                if (in_array($d['type'], ['custody', 'member_accountability', 'production_readiness'], true)) {
                    if ($p->picked_up_at && ! $p->holder_id && ! in_array($p->status, ['returned', 'delivered'], true)) {
                        $add('missing_custody', 'critical', 'Picked-up parcel has no current holder.');
                    }
                    if ($p->holder_id && ! User::where('id', $p->holder_id)->exists()) {
                        $add('invalid_holder', 'critical', 'Holder account is missing.');
                    }
                    if ($p->assigned_member_id && ! $p->picked_up_at && $p->assigned_at && strtotime($p->assigned_at) < now()->subDays(2)->timestamp) {
                        $add('stale_assignment', 'warning', 'Pickup assignment is older than two days.');
                    }
                }
                if (in_array($d['type'], ['financial', 'production_readiness'], true)) {
                    if ($p->status === 'delivered' && $p->collection_status !== 'received') {
                        $add('collection_pending', 'warning', 'Delivery collection has not been received.');
                    }
                    $credits = DB::table('wallet_transactions')->where('parcel_id', $p->id)->where('type', 'parcel_delivery_credit')->get();
                    if ($credits->count() > 1) {
                        $add('duplicate_delivery_credit', 'critical', 'Multiple sender delivery credits found.');
                    }
                    if ($credits->count() && ($p->status !== 'delivered' || $p->collection_status !== 'received')) {
                        $add('premature_wallet_credit', 'critical', 'Sender credit exists before confirmed delivery collection.');
                    }
                    if ($credits->count() && bccomp((string) $credits->first()->amount, $p->cod_enabled ? (string) $p->cod_amount : '0.00', 2) !== 0) {
                        $add('credit_mismatch', 'critical', 'Sender credit does not match the COD entitlement.');
                    }
                    if ($credits->count() && (int) $credits->first()->user_id !== (int) $p->sender_id) {
                        $add('credit_owner', 'critical', 'Sender credit belongs to another account.');
                    }
                    $commission = DB::table('commissions')->where('parcel_id', $p->id)->first();
                    if ($commission) {
                        if ($p->status !== 'delivered' || $p->collection_status !== 'received') {
                            $add('premature_commission', 'critical', 'Commission exists before confirmed delivery collection.');
                        }
                        if (bccomp(Money::add((string) $commission->member_amount, (string) $commission->company_amount), (string) $commission->delivery_charge, 2) !== 0) {
                            $add('commission_conservation', 'critical', 'Company and member amounts do not equal the delivery fee.');
                        }
                        $sum = (string) DB::table('commission_participants')->where('commission_id', $commission->id)->sum('amount');
                        if (bccomp($sum, (string) $commission->member_amount, 2) !== 0) {
                            $add('commission_allocation', 'critical', 'Participant allocations do not match the member commission pool.');
                        }
                        foreach (DB::table('commission_participants')->where('commission_id', $commission->id)->whereNotNull('settled_at')->get() as $allocation) {
                            $item = DB::table('settlement_items')->where('parcel_id', $p->id)->where('beneficiary_id', $allocation->user_id)->where('type', 'member')->first();
                            if (! $item) {
                                $add('missing_settlement_item', 'critical', 'A settled member allocation has no settlement item.');

                                continue;
                            }
                            $credit = DB::table('wallet_transactions')->where('operation_key', $item->operation_key)->first();
                            if (! $credit) {
                                $add('missing_member_credit', 'critical', 'A paid member settlement has no wallet ledger credit for member #'.$allocation->user_id.'.');
                            } elseif ((int) $credit->user_id !== (int) $allocation->user_id || bccomp((string) $credit->amount, (string) $allocation->amount, 2) !== 0) {
                                $add('member_credit_mismatch', 'critical', 'A member settlement credit does not match its beneficiary and allocation.');
                            }
                        }
                    }
                }
                if (in_array($d['type'], ['returns', 'production_readiness'], true) && $p->status === 'return_pending' && ! DB::table('parcel_returns')->where('parcel_id', $p->id)->where('status', 'pending')->exists()) {
                    $add('missing_return_request', 'critical', 'Return-pending parcel has no pending return record.');
                }
            }
            if (in_array($d['type'], ['financial', 'production_readiness'], true)) {
                foreach (User::where('district', $u->district)->get(['id', 'public_id', 'wallet_balance']) as $owner) {
                    $balance = (string) DB::table('wallet_transactions')->where('user_id', $owner->id)->sum('amount');
                    if (bccomp($balance, (string) $owner->wallet_balance, 2) !== 0) {
                        $findings[] = ['audit_run_id' => $run, 'parcel_id' => null, 'type' => 'wallet_ledger_mismatch', 'severity' => 'critical', 'details' => $owner->public_id.': wallet balance differs from the transaction ledger.', 'status' => 'open', 'created_at' => now(), 'updated_at' => now()];
                    }
                }
                foreach (DB::table('settlements')->where('district', $u->district)->get() as $settlement) {
                    $sum = (string) DB::table('settlement_items')->where('settlement_id', $settlement->id)->sum('amount');
                    if (bccomp($sum, (string) $settlement->amount, 2) !== 0) {
                        $findings[] = ['audit_run_id' => $run, 'parcel_id' => null, 'type' => 'settlement_total', 'severity' => 'critical', 'details' => $settlement->reference.': settlement items do not match the recorded total.', 'status' => 'open', 'created_at' => now(), 'updated_at' => now()];
                    }
                }
            }
            foreach ($findings as $f) {
                DB::table('audit_findings')->insert($f);
            }
            DB::table('audit_runs')->where('id', $run)->update(['summary' => json_encode(['parcels_checked' => $parcels->count(), 'findings' => count($findings), 'critical' => count(array_filter($findings, fn ($f) => $f['severity'] === 'critical'))])]);
            $activity->audit($u, 'audit_completed', 'audit_run', $run, null, ['type' => $d['type'], 'findings' => count($findings)]);

            return $run;
        });

        return response()->json(['id' => $id, 'message' => 'Audit completed.']);
    }

    public function snapshots(Request $r)
    {
        Access::admin($r->user());

        return response()->json(['data' => DB::table('safety_snapshots')->join('parcels', 'parcels.id', '=', 'safety_snapshots.parcel_id')->where('safety_snapshots.district', $r->user()->district)->select('safety_snapshots.id', 'safety_snapshots.parcel_id', 'safety_snapshots.created_at', 'safety_snapshots.note', 'parcels.code')->orderByDesc('safety_snapshots.id')->limit(100)->get()]);
    }

    public function recovery(Request $r, ParcelService $parcels, Activity $activity)
    {
        Access::admin($r->user());
        $d = $r->validate(['code' => 'required|string|max:9', 'action' => 'required|in:snapshot,restore-custody,cancel-transfer,reassign,controlled-transfer,clear-closed-custody', 'reason' => 'required|string|min:5|max:2000', 'member_id' => 'nullable|integer|exists:users,id', 'snapshot_id' => 'nullable|integer|exists:safety_snapshots,id']);
        DB::transaction(function () use ($r, $d, $parcels, $activity) {
            $u = $r->user();
            $p = $parcels->find($u, $d['code'], true);
            Access::district($u, $p->pickup_district);
            $change = [];
            if ($d['action'] === 'snapshot') {
                DB::table('safety_snapshots')->insert(['parcel_id' => $p->id, 'created_by' => $u->id, 'district' => $u->district, 'payload' => json_encode(['holder_id' => $p->holder_id, 'assigned_member_id' => $p->assigned_member_id, 'status' => $p->status, 'picked_up_at' => $p->picked_up_at]), 'note' => $d['reason'], 'created_at' => now(), 'updated_at' => now()]);
            } elseif ($d['action'] === 'restore-custody') {
                abort_unless(! in_array($p->status, ['delivered', 'returned'], true), 409);
                abort_unless($p->picked_up_at, 409, 'Only a physically picked-up parcel can have custody restored.');
                abort_if(DB::table('transfer_items')->join('transfers', 'transfers.id', '=', 'transfer_items.transfer_id')->where('parcel_id', $p->id)->where('transfers.status', 'pending')->where('expires_at', '>', now())->exists(), 409, 'Cancel the pending handover before restoring custody.');
                $s = DB::table('safety_snapshots')->where('id', $d['snapshot_id'] ?? 0)->where('parcel_id', $p->id)->where('district', $u->district)->first() ?? abort(422, 'Select a snapshot for this parcel.');
                $state = json_decode($s->payload, true);
                $holder = User::find($state['holder_id'] ?? 0);
                abort_unless($holder && $holder->isMember() && $holder->district === $u->district, 422, 'Snapshot holder is not currently eligible.');
                $change = ['holder_id' => $holder->id];
            } elseif ($d['action'] === 'clear-closed-custody') {
                abort_unless(in_array($p->status, ['delivered', 'returned'], true), 409);
                $change = ['holder_id' => null];
            } elseif ($d['action'] === 'cancel-transfer') {
                $ids = DB::table('transfer_items')->where('parcel_id', $p->id)->pluck('transfer_id');
                DB::table('transfers')->whereIn('id', $ids)->where('status', 'pending')->update(['status' => 'cancelled', 'updated_at' => now()]);
            } else {
                $member = User::find($d['member_id'] ?? 0);
                abort_unless($member && $member->isMember() && $member->district === $u->district, 422, 'Choose an eligible district member.');
                if ($d['action'] === 'reassign') {
                    abort_unless(! $p->picked_up_at && in_array($p->status, ['pending', 'assigned'], true), 409);
                    $parcels->assign($u, [$p->code], $member->id);
                } else {
                    abort_unless($p->picked_up_at && ! in_array($p->status, ['delivered', 'returned'], true), 409);
                    $pending = DB::table('transfer_items')->join('transfers', 'transfers.id', '=', 'transfer_items.transfer_id')->where('parcel_id', $p->id)->where('transfers.status', 'pending')->where('expires_at', '>', now())->exists();
                    abort_if($pending, 409, 'Cancel the pending handover first.');
                    $change = ['holder_id' => $member->id];
                    $activity->event($p->id, $u->id, 'handover', $d['reason'], ['from_user_id' => $p->holder_id, 'to_user_id' => $member->id]);
                }
            }
            if ($change) {
                DB::table('parcels')->where('id', $p->id)->update($change + ['updated_at' => now()]);
            }$activity->audit($u, $d['action'], 'parcel', $p->id, (array) $p, $change, $d['reason']);
        }, 3);

        return response()->json(['message' => 'Recovery operation recorded.']);
    }

    public function resolve(Request $r, int $id)
    {
        Access::admin($r->user());
        $d = $r->validate(['reason' => 'required|string|min:5|max:2000']);
        $f = DB::table('audit_findings')->join('audit_runs', 'audit_runs.id', '=', 'audit_findings.audit_run_id')->where('audit_findings.id', $id)->where('district', $r->user()->district)->first(['audit_findings.id']) ?? abort(404);
        DB::transaction(function () use ($r, $d, $f) {
            DB::table('audit_findings')->where('id', $f->id)->update(['status' => 'resolved', 'updated_at' => now()]);
            app(Activity::class)->audit($r->user(), 'finding_resolved', 'audit_finding', $f->id, null, null, $d['reason']);
        });

        return response()->json(['message' => 'Finding resolved.']);
    }

    public function rates(Request $r)
    {
        Access::admin($r->user());
        $d = $r->validate(['base_charge' => 'required|decimal:0,2|min:0|max:10000', 'extra_per_100g' => 'required|decimal:0,2|min:0|max:1000']);
        DB::table('settings')->updateOrInsert(['key' => 'delivery_rates'], ['value' => json_encode($d + ['included_weight_grams' => 1000]), 'created_at' => now(), 'updated_at' => now()]);

        return response()->json(['message' => 'Delivery rates saved.']);
    }
}
