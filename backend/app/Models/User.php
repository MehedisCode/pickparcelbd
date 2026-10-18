<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $guarded = ['id', 'role', 'wallet_balance', 'verified', 'google_id'];

    protected $hidden = ['remember_token', 'google_id', 'password'];

    protected function casts(): array
    {
        return ['verified' => 'boolean', 'phone_public' => 'boolean', 'wallet_balance' => 'decimal:2', 'latitude' => 'float', 'longitude' => 'float', 'last_seen_at' => 'datetime'];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isMember(): bool
    {
        return in_array($this->role, config('pickparcel.member_roles'), true);
    }

    public function profileComplete(): bool
    {
        return filled($this->phone) && filled($this->address) && filled($this->district) && filled($this->upazila);
    }
}
