<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\Activity;
use App\Services\FinanceService;
use App\Services\FinancialRecovery;
use App\Support\Access;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinanceController extends Controller
{
    public function wallet(Request $r)
    {
        return response()->json(['balance' => $r->user()->wallet_balance, 'transactions' => DB::table('wallet_transactions')->leftJoin('parcels', 'parcels.id', '=', 'wallet_transactions.parcel_id')->where('user_id', $r->user()->id)->select('wallet_transactions.*', 'parcels.code')->orderByDesc('wallet_transactions.id')->paginate(20)]);
    }

    public function index(Request $r)
    {
        $u = $r->user();
        Access::admin($u);

        $collections = DB::table('parcels')->where('pickup_district', $u->district)->whereIn('status', ['delivered', 'returned'])->orderByDesc('id')->paginate(50, ['id', 'code', 'sender_id', 'status', 'delivery_charge', 'cod_amount', 'cod_enabled', 'collected_amount', 'collection_status']);
        $commissions = DB::table('commissions')->join('parcels', 'parcels.id', '=', 'commissions.parcel_id')->where('commissions.district', $u->district)->select('commissions.*', 'parcels.code')->orderByDesc('commissions.id')->paginate(50);
        $settlements = DB::table('settlements')->where('district', $u->district)->orderByDesc('id')->paginate(50);
        $allocations = DB::table('commission_participants')->join('commissions', 'commissions.id', '=', 'commission_participants.commission_id')->join('users', 'users.id', '=', 'commission_participants.user_id')->where('commissions.district', $u->district);

        return response()->json([
            'collections' => $collections->items(), 'commissions' => $commissions->items(), 'settlements' => $settlements->items(),
            'participants' => (clone $allocations)->whereIn('commissions.id', $commissions->getCollection()->pluck('id'))->select('commission_participants.*', 'users.name')->get(),
            'beneficiaries' => (clone $allocations)->whereNull('settled_at')->select('users.id', 'users.name', 'users.public_id')->distinct()->get(),
            'pages' => ['collections' => $collections->lastPage(), 'commissions' => $commissions->lastPage(), 'settlements' => $settlements->lastPage()],
            'rules' => DB::table('commission_rules')->where('district', $u->district)->first(),
            'summary' => [
                'pending_collections' => DB::table('parcels')->where('pickup_district', $u->district)->where('status', 'delivered')->where('collection_status', 'pending')->sum('collected_amount'),
                'unpaid_member' => (clone $allocations)->whereNull('settled_at')->sum('commission_participants.amount'),
                'unpaid_company' => DB::table('commissions')->where('district', $u->district)->whereNull('company_settled_at')->sum('company_amount'),
            ],
        ]);
    }

    public function rule(Request $r)
    {
        Access::admin($r->user());
        $d = $r->validate(['rider_percent' => 'required|decimal:0,2|between:0,100', 'agent_percent' => 'required|decimal:0,2|between:0,100', 'company_percent' => 'required|decimal:0,2|between:0,100']);
        abort_unless(bccomp(Money::add(Money::add((string) $d['rider_percent'], (string) $d['agent_percent']), (string) $d['company_percent']), '100', 2) === 0, 422, 'Commission percentages must total 100%.');
        DB::transaction(function () use ($r, $d) {
            $before = DB::table('commission_rules')->where('district', $r->user()->district)->first();
            DB::table('commission_rules')->updateOrInsert(['district' => $r->user()->district], $d + ['created_at' => now(), 'updated_at' => now()]);
            app(Activity::class)->audit($r->user(), 'commission_rule_updated', 'commission_rule', $r->user()->district, $before, $d);
        });

        return response()->json(['message' => 'Commission rule saved.']);
    }

    public function command(Request $r, string $code, string $action, FinanceService $finance)
    {
        $finance->parcelCommand($r->user(), $code, $action);

        return response()->json(['message' => 'Financial operation completed.']);
    }

    public function settle(Request $r, FinanceService $finance)
    {
        $d = $r->validate(['type' => 'required|in:member,company', 'user_id' => 'required_if:type,member|nullable|integer|exists:users,id', 'note' => 'nullable|string|max:2000']);

        return response()->json(['id' => $finance->settle($r->user(), $d['type'], $d['user_id'] ?? null, $d['note'] ?? null), 'message' => 'Commission settled.']);
    }

    public function repair(Request $r, string $code, string $action, FinancialRecovery $recovery)
    {
        $d = $r->validate(['reason' => 'required|string|min:5|max:2000', 'user_id' => 'nullable|integer|exists:users,id', 'public_id' => ($action === 'repair-member-credit' ? 'required_without:user_id' : 'nullable').'|string|exists:users,public_id']);
        $userId = $d['user_id'] ?? (! empty($d['public_id']) ? User::where('public_id', $d['public_id'])->value('id') : null);
        $recovery->repair($r->user(), $code, $action, $d['reason'], $userId);

        return response()->json(['message' => 'Evidence-based recovery recorded.']);
    }
}
