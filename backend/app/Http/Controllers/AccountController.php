<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\Geocoding;
use App\Support\Access;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccountController extends Controller
{
    public function reverseGeocode(Request $r, Geocoding $geocoding)
    {
        $d = $r->validate(['latitude' => 'required|numeric|between:-90,90', 'longitude' => 'required|numeric|between:-180,180', 'consent' => 'required|accepted']);

        return response()->json($geocoding->reverse((float) $d['latitude'], (float) $d['longitude']));
    }

    public function update(Request $r)
    {
        $d = $r->validate(['name' => 'sometimes|required|string|max:255', 'phone' => 'sometimes|required|string|min:7|max:30', 'public_phone' => 'nullable|string|max:50', 'phone_public' => 'sometimes|boolean', 'address' => 'sometimes|required|string|max:2000', 'district' => 'sometimes|required|string|max:100', 'upazila' => 'sometimes|required|string|max:100', 'news' => 'nullable|string|max:2000']);
        if ($r->user()->isAdmin() && isset($d['district'])) {
            abort_unless($d['district'] === $r->user()->district, 422, 'Administrator district changes require an audited reassignment.');
        }
        $r->user()->fill($d)->save();

        return response()->json(['user' => $r->user(), 'message' => 'Profile saved.']);
    }

    public function location(Request $r)
    {
        $d = $r->validate(['latitude' => 'required|numeric|between:-90,90', 'longitude' => 'required|numeric|between:-180,180', 'location_accuracy' => 'nullable|numeric|min:0|max:100000']);
        $r->user()->fill($d + ['location_updated_at' => now()])->save();
        DB::table('driver_states')->where('user_id', $r->user()->id)->update($d = ['latitude' => $d['latitude'], 'longitude' => $d['longitude'], 'location_updated_at' => now(), 'updated_at' => now()]);

        return response()->json(['message' => 'Location updated.']);
    }

    public function heartbeat(Request $r)
    {
        $r->user()->forceFill(['last_seen_at' => now(), 'online' => true])->save();
        $ids = $r->validate(['ids' => 'sometimes|array|max:100', 'ids.*' => 'integer|min:1'])['ids'] ?? [];

        return response()->json(['presence' => DB::table('users')->whereIn('id', $ids)->select('id', 'online', 'last_seen_at')->get()->map(fn ($u) => ['id' => $u->id, 'online' => $u->online && $u->last_seen_at && strtotime($u->last_seen_at) > time() - 35, 'last_seen_at' => $u->last_seen_at]), 'unread' => DB::table('notifications')->where('user_id', $r->user()->id)->whereNull('read_at')->count(), 'unread_messages' => DB::table('messages')->where('receiver_id', $r->user()->id)->where('receiver_deleted', false)->whereNull('read_at')->count()]);
    }

    public function terms(Request $r)
    {
        $r->user()->forceFill(['terms_viewed_at' => now()])->save();

        return response()->json(['message' => 'Terms acknowledged.']);
    }

    public function dashboard(Request $r)
    {
        $u = $r->user();
        $base = Access::parcels(DB::table('parcels'), $u);
        $counts = (clone $base)->selectRaw('status, COUNT(*) as count')->groupBy('status')->pluck('count', 'status');
        $recent = (clone $base)->orderByDesc('id')->limit(6)->get(['id', 'code', 'delivery_name', 'delivery_district', 'status', 'delivery_charge', 'created_at']);
        $transactions = DB::table('wallet_transactions')->where('user_id', $u->id);
        $chart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $chart[] = ['date' => $date, 'count' => (clone $base)->whereDate('created_at', $date)->count()];
        }

        return response()->json(['counts' => $counts, 'total' => $counts->sum(), 'recent' => $recent, 'chart' => $chart, 'wallet_balance' => $u->wallet_balance, 'earnings' => (clone $transactions)->where('type', 'commission_credit')->sum('amount'), 'notifications' => DB::table('notifications')->where('user_id', $u->id)->orderByDesc('id')->limit(5)->get(), 'orders' => DB::table('orders')->where(fn ($q) => $q->where('buyer_id', $u->id)->orWhere('seller_id', $u->id))->count()]);
    }

    public function members(Request $r)
    {
        $q = User::whereIn('role', config('pickparcel.member_roles'))->where('district', $r->user()->district);

        return response()->json(['data' => $q->get(['id', 'public_id', 'name', 'role', 'district', 'upazila', 'verified'])]);
    }
}
