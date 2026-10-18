<?php

namespace App\Services;

use App\Models\User;
use DomainException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Two\User as GoogleUser;

class GoogleAccounts
{
    public function resolve(GoogleUser $google): User
    {
        $email = strtolower(trim((string) $google->getEmail()));
        $googleId = (string) $google->getId();
        for ($attempt = 0; $attempt < 3; $attempt++) {
            try {
                return DB::transaction(function () use ($google, $googleId, $email) {
                    $identity = User::where('google_id', $googleId)->lockForUpdate()->first();
                    $emailOwner = User::whereRaw('LOWER(email) = ?', [$email])->lockForUpdate()->first();
                    if ($emailOwner && (! $identity || $identity->id !== $emailOwner->id)) {
                        throw new DomainException('Google identity conflicts with an existing account.');
                    }
                    // Existing accounts must match Google's stable subject ID.
                    // An email match alone must never transfer a role or wallet.
                    $user = $identity;
                    if (! $user) {
                        $user = new User;
                        $user->forceFill(['public_id' => 'PP'.random_int(1000000000, 9999999999), 'role' => 'customer', 'wallet_balance' => '0.00']);
                    }
                    $user->forceFill(['google_id' => $googleId, 'email' => $email, 'name' => mb_substr($google->getName() ?: $google->getNickname() ?: 'PickParcel user', 0, 255), 'avatar_url' => $google->getAvatar()])->save();

                    return $user;
                }, 3);
            } catch (UniqueConstraintViolationException $exception) {
                // A simultaneous first login or public-ID collision may win the insert.
                // Retry the lookup in a fresh transaction instead of creating a duplicate.
                if ($attempt === 2) {
                    throw $exception;
                }
            }
        }

        throw new DomainException('Account could not be resolved.');
    }
}
