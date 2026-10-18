<?php

namespace App\Http\Controllers;

use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $r)
    {
        $u = $r->user();
        $q = DB::table('orders')->join('users as buyer', 'buyer.id', '=', 'orders.buyer_id')->join('users as seller', 'seller.id', '=', 'orders.seller_id')
            ->where(function ($q) use ($u) {
                $q->where(fn ($q) => $q->where('buyer_id', $u->id)->whereNull('buyer_hidden_at'))->orWhere(fn ($q) => $q->where('seller_id', $u->id)->whereNull('seller_hidden_at'));
            })
            ->select('orders.*', 'buyer.name as buyer_name', 'seller.name as seller_name');
        if ($r->query('side') === 'sales') {
            $q->where('seller_id', $u->id);
        }if ($r->query('side') === 'purchases') {
            $q->where('buyer_id', $u->id);
        }
        if ($r->filled('status')) {
            $q->where('orders.status', $r->query('status'));
        }if ($r->filled('search')) {
            $q->where('orders.id', preg_replace('/\D/', '', (string) $r->query('search')));
        }

        return response()->json($q->orderByDesc('orders.id')->paginate(20));
    }

    public function show(Request $r, int $id)
    {
        $o = DB::table('orders')->where('id', $id)->where(fn ($q) => $q->where('buyer_id', $r->user()->id)->orWhere('seller_id', $r->user()->id))->first() ?? abort(404);

        return response()->json(['order' => $o, 'items' => DB::table('order_items')->where('order_id', $id)->get(), 'parcel' => DB::table('parcels')->where('order_id', $id)->first(['code', 'status']), 'buyer' => DB::table('users')->where('id', $o->buyer_id)->first(['id', 'name', 'phone', 'address', 'district', 'upazila']), 'seller' => DB::table('users')->where('id', $o->seller_id)->first(['id', 'name', 'phone', 'address', 'district', 'upazila'])]);
    }

    public function store(Request $r, OrderService $orders)
    {
        $d = $r->validate(['items' => 'required|array|min:1|max:100', 'items.*.product_id' => 'required|integer|min:1', 'items.*.quantity' => 'required|integer|between:1,99', 'payment_method' => 'required|in:cod,prepaid', 'fingerprint' => 'required|string|size:64', 'terms_accepted' => 'required|accepted']);
        $r->user()->forceFill(['terms_viewed_at' => now()])->save();

        return response()->json(['order_ids' => $orders->checkout($r->user(), $d['items'], $d['payment_method'], $d['fingerprint']), 'message' => 'Order placed successfully.'], 201);
    }

    public function quote(Request $r, OrderService $orders)
    {
        $d = $r->validate(['items' => 'required|array|min:1|max:100', 'items.*.product_id' => 'required|integer|min:1', 'items.*.quantity' => 'required|integer|between:1,99', 'payment_method' => 'required|in:cod,prepaid']);

        return response()->json($orders->quote($r->user(), $d['items'], $d['payment_method']));
    }

    public function confirm(Request $r, int $id, OrderService $orders)
    {
        $p = $orders->confirm($r->user(), $id);

        return response()->json(['message' => 'Order confirmed and parcel created.', 'parcel_code' => $p->code]);
    }

    public function hide(Request $r, int $id)
    {
        $o = DB::table('orders')->where('id', $id)->where(fn ($q) => $q->where('buyer_id', $r->user()->id)->orWhere('seller_id', $r->user()->id))->first() ?? abort(404);
        DB::table('orders')->where('id', $id)->update([(int) $o->buyer_id === $r->user()->id ? 'buyer_hidden_at' : 'seller_hidden_at' => now()]);

        return response()->json(['message' => 'Order hidden from your list.']);
    }
}
