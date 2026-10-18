<?php

namespace App\Services;

use App\Models\User;
use App\Support\Money;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(private Pricing $pricing, private ParcelService $parcels, private Activity $activity) {}

    public function quote(User $buyer, array $items, string $method): array
    {
        $quantities = [];
        foreach ($items as $item) {
            $quantities[(int) $item['product_id']] = ($quantities[(int) $item['product_id']] ?? 0) + (int) $item['quantity'];
        }
        ksort($quantities);
        $groups = [];
        $total = '0.00';
        foreach ($quantities as $id => $qty) {
            abort_if($qty > 99, 422, 'Maximum quantity is 99 per product.');
            $p = DB::table('products')->whereNull('deleted_at')->where('active', true)->find($id) ?? abort(422, 'Some products are no longer available.');
            abort_if((int) $p->user_id === $buyer->id, 422, 'You cannot order your own products.');
            abort_if(DB::table('buyer_blocks')->where('seller_id', $p->user_id)->where('buyer_id', $buyer->id)->exists(), 403, 'This seller cannot accept your order.');
            if (! isset($groups[$p->user_id])) {
                $groups[$p->user_id] = ['seller_id' => $p->user_id, 'seller_name' => User::find($p->user_id)?->name, 'subtotal' => '0.00', 'delivery_charge' => $this->pricing->delivery(1000), 'items' => []];
            }
            $price = $this->pricing->product($p);
            $amount = Money::multiply($price, $qty);
            $groups[$p->user_id]['items'][] = ['product_id' => $id, 'quantity' => $qty, 'unit_price' => $price];
            $groups[$p->user_id]['subtotal'] = Money::add($groups[$p->user_id]['subtotal'], $amount);
        }
        foreach ($groups as &$group) {
            $group['total'] = Money::add($group['subtotal'], $group['delivery_charge']);
            $total = Money::add($total, $group['total']);
        }unset($group);
        $result = ['groups' => array_values($groups), 'total' => $total, 'payment_method' => $method];

        return $result + ['fingerprint' => hash('sha256', json_encode($result))];
    }

    public function checkout(User $buyer, array $items, string $method, ?string $fingerprint = null): array
    {
        abort_unless($buyer->profileComplete(), 422, 'Complete your delivery profile before checkout.');

        return DB::transaction(function () use ($buyer, $items, $method, $fingerprint) {
            $quantities = [];
            foreach ($items as $item) {
                $quantities[(int) $item['product_id']] = ($quantities[(int) $item['product_id']] ?? 0) + (int) $item['quantity'];
            }
            foreach ($quantities as $qty) {
                abort_if($qty > 99, 422, 'Maximum quantity is 99 per product.');
            }
            $products = DB::table('products')->whereIn('id', array_keys($quantities))->whereNull('deleted_at')->where('active', true)->orderBy('id')->lockForUpdate()->get();
            abort_unless($products->count() === count($quantities), 422, 'Some products are no longer available.');
            if ($fingerprint !== null) {
                abort_unless(hash_equals($this->quote($buyer, $items, $method)['fingerprint'], $fingerprint), 409, 'Prices or delivery rates changed. Review your order again.');
            }
            $groups = $products->groupBy('user_id');
            $ids = [];
            foreach ($groups as $sellerId => $rows) {
                abort_if((int) $sellerId === $buyer->id, 422, 'You cannot order your own products.');
                abort_if(DB::table('buyer_blocks')->where('seller_id', $sellerId)->where('buyer_id', $buyer->id)->exists(), 403, 'This seller cannot accept your order.');
                $subtotal = '0.00';
                $lines = [];
                foreach ($rows as $p) {
                    $price = $this->pricing->product($p);
                    $amount = Money::multiply($price, $quantities[$p->id]);
                    $subtotal = Money::add($subtotal, $amount);
                    $lines[] = ['product_id' => $p->id, 'name' => $p->name, 'unit_price' => $price, 'quantity' => $quantities[$p->id], 'total' => $amount, 'created_at' => now(), 'updated_at' => now()];
                }
                $charge = $this->pricing->delivery(1000);
                $id = DB::table('orders')->insertGetId(['buyer_id' => $buyer->id, 'seller_id' => $sellerId, 'subtotal' => $subtotal, 'delivery_charge' => $charge, 'total' => Money::add($subtotal, $charge), 'cod_enabled' => $method === 'cod', 'cod_amount' => $method === 'cod' ? $subtotal : '0.00', 'status' => 'pending', 'created_at' => now(), 'updated_at' => now()]);
                foreach ($lines as $line) {
                    DB::table('order_items')->insert($line + ['order_id' => $id]);
                }
                $this->activity->notify((int) $sellerId, 'new_order', 'নতুন অর্ডার', $buyer->name.' placed order #'.$id, '/dashboard/orders/'.$id, $buyer->id);
                $ids[] = $id;
            }

            return $ids;
        }, 3);
    }

    public function confirm(User $seller, int $id): object
    {
        return DB::transaction(function () use ($seller, $id) {
            $o = DB::table('orders')->where('seller_id', $seller->id)->where('id', $id)->lockForUpdate()->first() ?? abort(404);
            abort_unless($o->status === 'pending', 409, 'This order has already been processed.');
            $buyer = User::findOrFail($o->buyer_id);
            abort_unless($buyer->profileComplete(), 422, 'The buyer must complete their delivery profile.');
            $p = $this->parcels->create($seller, ['order_id' => $o->id, 'recipient_id' => $buyer->id, 'source' => $o->cash_memo_id ? 'cash_memo' : 'order', 'delivery_name' => $buyer->name, 'delivery_phone' => $buyer->phone, 'delivery_address' => $buyer->address, 'delivery_district' => $buyer->district, 'delivery_upazila' => $buyer->upazila, 'delivery_charge' => $o->delivery_charge, 'cod_enabled' => (bool) $o->cod_enabled, 'cod_amount' => $o->cod_amount]);
            DB::table('orders')->where('id', $id)->update(['status' => 'confirmed', 'confirmed_at' => now(), 'updated_at' => now()]);
            $this->activity->notify($buyer->id, 'order_confirmed', 'অর্ডার কনফার্ম হয়েছে', 'Order #'.$id.' is ready for delivery. Tracking RFD'.$p->code, '/dashboard/orders/'.$id, $seller->id);

            return $p;
        }, 3);
    }
}
