<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\OrderService;
use App\Services\Pricing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CashMemoController extends Controller
{
    private function find(Request $r, int $id): object
    {
        return DB::table('cash_memos')->where('id', $id)->where(fn ($q) => $q->where('buyer_id', $r->user()->id)->orWhere('seller_id', $r->user()->id))->first() ?? abort(404);
    }

    public function index(Request $r)
    {
        return response()->json(DB::table('cash_memos')->join('users as buyer', 'buyer.id', '=', 'cash_memos.buyer_id')->join('users as seller', 'seller.id', '=', 'cash_memos.seller_id')->where(fn ($q) => $q->where('buyer_id', $r->user()->id)->orWhere('seller_id', $r->user()->id))->select('cash_memos.*', 'buyer.name as buyer_name', 'seller.name as seller_name')->orderByDesc('cash_memos.id')->paginate(20));
    }

    public function store(Request $r)
    {
        $d = $r->validate(['seller_id' => 'required|integer|exists:users,id']);
        abort_if((int) $d['seller_id'] === $r->user()->id, 422, 'Choose another seller.');
        abort_if(DB::table('buyer_blocks')->where('seller_id', $d['seller_id'])->where('buyer_id', $r->user()->id)->exists(), 403);
        $id = DB::transaction(function () use ($r, $d) {
            DB::table('users')->where('id', $r->user()->id)->lockForUpdate()->first();
            $existing = DB::table('cash_memos')->where('buyer_id', $r->user()->id)->where('seller_id', $d['seller_id'])->where('status', 'draft')->first();

            return $existing?->id ?? DB::table('cash_memos')->insertGetId(['buyer_id' => $r->user()->id, 'seller_id' => $d['seller_id'], 'status' => 'draft', 'created_at' => now(), 'updated_at' => now()]);
        });

        return response()->json(['id' => $id], 201);
    }

    public function show(Request $r, int $id)
    {
        $m = $this->find($r, $id);

        return response()->json(['memo' => $m, 'buyer' => User::find($m->buyer_id)?->only(['id', 'name', 'phone', 'address', 'public_id']), 'seller' => User::find($m->seller_id)?->only(['id', 'name', 'phone', 'address', 'public_id']), 'documents' => DB::table('documents')->where('cash_memo_id', $id)->get(['id', 'role', 'mime', 'size', 'created_at']), 'order' => DB::table('orders')->where('cash_memo_id', $id)->first(['id', 'status'])]);
    }

    public function upload(Request $r, int $id)
    {
        $m = $this->find($r, $id);
        abort_unless($m->status === 'draft', 409, 'This memo has already been sent.');
        $d = $r->validate(['role' => 'required|in:buyer,seller,payment', 'image' => 'required|image|mimes:jpeg,png,webp|max:8192']);
        $seller = (int) $m->seller_id === $r->user()->id;
        abort_unless(($seller && $d['role'] === 'seller') || (! $seller && in_array($d['role'], ['buyer', 'payment'], true)), 403);
        $path = $r->file('image')->store('cash-memos', 'local');
        try {
            DB::transaction(function () use ($r, $m, $d, $path) {
                DB::table('cash_memos')->where('id', $m->id)->lockForUpdate()->first();
                abort_if(DB::table('orders')->where('cash_memo_id', $m->id)->exists(), 409);
                $old = DB::table('documents')->where('cash_memo_id', $m->id)->where('role', $d['role'])->first();
                DB::table('documents')->updateOrInsert(['cash_memo_id' => $m->id, 'role' => $d['role']], ['user_id' => $r->user()->id, 'path' => $path, 'mime' => $r->file('image')->getMimeType(), 'size' => $r->file('image')->getSize(), 'created_at' => now(), 'updated_at' => now()]);
                if ($old) {
                    DB::afterCommit(fn () => Storage::disk('local')->delete($old->path));
                }
            });
        } catch (\Throwable $e) {
            Storage::disk('local')->delete($path);
            throw $e;
        }

        return response()->json(['message' => 'Document uploaded.']);
    }

    public function document(Request $r, int $id)
    {
        $d = DB::table('documents')->find($id) ?? abort(404);
        $this->find($r, $d->cash_memo_id);
        abort_unless(Storage::disk('local')->exists($d->path), 404);

        return response()->file(Storage::disk('local')->path($d->path), ['Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff']);
    }

    public function destroyDocument(Request $r, int $id)
    {
        $d = DB::table('documents')->find($id) ?? abort(404);
        $m = $this->find($r, $d->cash_memo_id);
        abort_unless((int) $d->user_id === $r->user()->id && $m->status === 'draft', 403);
        DB::transaction(function () use ($d, $m) {
            DB::table('cash_memos')->where('id', $m->id)->lockForUpdate()->first();
            abort_if(DB::table('orders')->where('cash_memo_id', $m->id)->exists(), 409);
            DB::table('documents')->where('id', $d->id)->delete();
            DB::afterCommit(fn () => Storage::disk('local')->delete($d->path));
        });

        return response()->json(['message' => 'Document removed.']);
    }

    public function send(Request $r, int $id, OrderService $orders)
    {
        return DB::transaction(function () use ($r, $id, $orders) {
            $m = $this->find($r, $id);
            DB::table('cash_memos')->where('id', $id)->lockForUpdate()->first();
            abort_unless((int) $m->seller_id === $r->user()->id, 403);
            abort_unless($m->status === 'draft' && ! DB::table('orders')->where('cash_memo_id', $id)->exists(), 409);
            $roles = DB::table('documents')->where('cash_memo_id', $id)->pluck('role')->all();
            abort_unless(in_array('buyer', $roles, true) && in_array('seller', $roles, true), 422, 'Buyer order list and seller cash memo images are required.');
            $oid = DB::table('orders')->insertGetId(['cash_memo_id' => $id, 'buyer_id' => $m->buyer_id, 'seller_id' => $m->seller_id, 'subtotal' => '0.00', 'delivery_charge' => app(Pricing::class)->delivery(1000), 'total' => app(Pricing::class)->delivery(1000), 'cod_enabled' => false, 'cod_amount' => '0.00', 'status' => 'pending', 'created_at' => now(), 'updated_at' => now()]);
            $p = $orders->confirm($r->user(), $oid);
            DB::table('cash_memos')->where('id', $id)->update(['status' => 'sent_to_pickparcel', 'updated_at' => now()]);

            return response()->json(['order_id' => $oid, 'parcel_code' => $p->code, 'message' => 'Cash memo sent for delivery.']);
        }, 3);
    }
}
