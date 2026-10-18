<?php

namespace App\Services;

use App\Support\Money;
use Illuminate\Support\Facades\DB;

class Pricing
{
    public function rates(): array
    {
        $value = DB::table('settings')->where('key', 'delivery_rates')->value('value');

        return $value ? json_decode($value, true) : ['base_charge' => config('pickparcel.base_charge'), 'extra_per_100g' => config('pickparcel.extra_per_100g'), 'included_weight_grams' => 1000];
    }

    public function delivery(int $grams): string
    {
        $r = $this->rates();
        $units = intdiv(max(0, $grams - (int) $r['included_weight_grams']) + 99, 100);

        return Money::add(Money::value($r['base_charge']), Money::multiply(Money::value($r['extra_per_100g']), $units));
    }

    public function product(object $p): string
    {
        $price = Money::value($p->price);
        if ($p->discount_price && bccomp((string) $p->discount_price, '0', 2) > 0 && bccomp((string) $p->discount_price, $price, 2) < 0) {
            return Money::value($p->discount_price);
        }
        if ($p->discount_percent && bccomp((string) $p->discount_percent, '0', 2) > 0 && bccomp((string) $p->discount_percent, '100', 2) < 0) {
            return Money::sub($price, Money::percent($price, (string) $p->discount_percent));
        }

        return $price;
    }
}
