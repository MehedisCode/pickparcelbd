<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\Pricing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PublicController extends Controller
{
    public function __construct(private Pricing $pricing) {}

    public function config()
    {
        return response()->json(['geocoding_available' => (bool) config('pickparcel.geocoding_enabled'), 'rates' => $this->pricing->rates(), 'categories' => ['all', 'fashion', 'electronics', 'home', 'beauty', 'food', 'other'], 'support' => ['email' => config('pickparcel.support_email'), 'phone' => config('pickparcel.support_phone')], 'google_available' => (bool) config('services.google.client_id')]);
    }

    public function products(Request $r)
    {
        $q = DB::table('products')->join('users', 'users.id', '=', 'products.user_id')->whereNull('products.deleted_at')
            ->select('products.*', 'users.name as seller_name', 'users.public_id as seller_public_id', 'users.verified as seller_verified', 'users.avatar_url as seller_avatar', 'users.district as seller_district');
        if ($search = trim((string) $r->query('search'))) {
            $q->where(fn ($q) => $q->where('products.name', 'like', '%'.$search.'%')->orWhere('products.description', 'like', '%'.$search.'%')->orWhere('users.name', 'like', '%'.$search.'%'));
        }
        if ($r->filled('category') && $r->query('category') !== 'all') {
            $q->where('category', $r->query('category'));
        }
        if ($r->filled('seller')) {
            $q->where('users.public_id', $r->query('seller'));
        }
        if ($r->boolean('mine')) {
            $u = $r->user();
            abort_unless($u, 401);
            $q->where('products.user_id', $u->id);
        } else {
            $q->where('products.active', true);
        }
        $sort = $r->query('sort');
        if ($sort === 'price_asc') {
            $q->orderBy('products.price');
        } elseif ($sort === 'price_desc') {
            $q->orderByDesc('products.price');
        } else {
            $q->orderByDesc('products.id');
        }
        $page = $q->paginate(12);
        $page->through(fn ($p) => (array) $p + ['effective_price' => $this->pricing->product($p)]);

        return response()->json($page);
    }

    public function product(Request $r, int $id)
    {
        $p = DB::table('products')->whereNull('deleted_at')->find($id) ?? abort(404);
        abort_unless($p->active || $r->user()?->id === (int) $p->user_id, 404);
        $seller = User::findOrFail($p->user_id);

        return response()->json(['product' => (array) $p + ['effective_price' => $this->pricing->product($p)], 'seller' => $this->publicUser($seller)]);
    }

    public function publicUser(User $u): array
    {
        return ['id' => $u->id, 'public_id' => $u->public_id, 'name' => $u->name, 'avatar_url' => $u->avatar_url, 'verified' => $u->verified, 'role' => $u->isMember() ? 'member' : 'seller', 'district' => $u->district, 'upazila' => $u->upazila, 'public_phone' => $u->public_phone ?: ($u->phone_public ? $u->phone : null), 'news' => $u->news, 'share_count' => $u->share_count];
    }

    public function profile(Request $r, string $publicId)
    {
        $u = User::where('public_id', $publicId)->firstOrFail();
        $comments = DB::table('profile_comments')->join('users', 'users.id', '=', 'profile_comments.user_id')->where('target_user_id', $u->id)->select('profile_comments.*', 'users.name', 'users.avatar_url')->orderByDesc('profile_comments.id')->limit(50)->get();

        return response()->json(['user' => $this->publicUser($u), 'followers' => DB::table('follows')->where('following_id', $u->id)->count(), 'following' => DB::table('follows')->where('follower_id', $u->id)->count(), 'products' => DB::table('products')->where('user_id', $u->id)->whereNull('deleted_at')->count(), 'is_following' => $r->user() ? DB::table('follows')->where('following_id', $u->id)->where('follower_id', $r->user()->id)->exists() : false, 'comments' => $comments]);
    }

    public function tracking(string $code)
    {
        $digits = preg_replace('/^RFD/i', '', trim($code));
        abort_unless(preg_match('/^\d{5,6}$/', $digits), 422, 'Enter a valid RFD tracking code.');
        $p = DB::table('parcels')->where('code', str_pad($digits, 6, '0', STR_PAD_LEFT))->first() ?? abort(404, 'No parcel found with this code.');
        $events = DB::table('parcel_events')->where('parcel_id', $p->id)->whereNotIn('type', ['message', 'weight', 'wallet-credit'])->orderBy('id')->get(['type', 'created_at']);

        return response()->json(['parcel' => ['code' => $p->code, 'status' => $p->status, 'source' => $p->source, 'pickup_district' => $p->pickup_district, 'delivery_district' => $p->delivery_district, 'created_at' => $p->created_at, 'delivered_at' => $p->delivered_at], 'events' => $events]);
    }
}
