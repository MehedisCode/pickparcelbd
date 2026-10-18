<?php

namespace App\Support;

final class Money
{
    public static function value(string|int|float|null $value): string
    {
        $s = (string) ($value ?? '0');
        if (! preg_match('/^-?\d+(?:\.\d{1,6})?$/', $s)) {
            abort(422, 'Invalid monetary amount.');
        }

        return bcadd($s, bccomp($s, '0', 6) < 0 ? '-0.005' : '0.005', 2);
    }

    public static function add(string $a, string $b): string
    {
        return bcadd($a, $b, 2);
    }

    public static function sub(string $a, string $b): string
    {
        return bcsub($a, $b, 2);
    }

    public static function multiply(string $a, string|int $b): string
    {
        return self::value(bcmul($a, (string) $b, 6));
    }

    public static function percent(string $a, string $percent): string
    {
        return self::value(bcdiv(bcmul($a, $percent, 6), '100', 6));
    }

    public static function positive(string $a): bool
    {
        return bccomp($a, '0', 2) > 0;
    }
}
