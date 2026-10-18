<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $t) {
            $t->id();
            $t->string('public_id', 20)->unique();
            $t->string('google_id')->nullable()->unique();
            $t->string('email', 320)->unique();
            $t->string('name');
            $t->text('avatar_url')->nullable();
            $t->string('phone', 30)->nullable();
            $t->string('public_phone', 50)->nullable();
            $t->boolean('phone_public')->default(false);
            $t->text('address')->nullable();
            $t->string('district', 100)->nullable()->index();
            $t->string('upazila', 100)->nullable();
            $t->string('union_name', 150)->nullable();
            $t->decimal('latitude', 10, 7)->nullable();
            $t->decimal('longitude', 10, 7)->nullable();
            $t->decimal('location_accuracy', 10, 2)->nullable();
            $t->timestamp('location_updated_at')->nullable();
            $t->string('role', 30)->default('customer')->index();
            $t->boolean('verified')->default(false);
            $t->foreignId('verified_by')->nullable();
            $t->decimal('wallet_balance', 18, 2)->default(0);
            $t->text('news')->nullable();
            $t->unsignedBigInteger('share_count')->default(0);
            $t->timestamp('last_seen_at')->nullable()->index();
            $t->boolean('online')->default(false);
            $t->timestamp('terms_viewed_at')->nullable();
            $t->rememberToken();
            $t->timestamps();
        });
        Schema::create('sessions', function (Blueprint $t) {
            $t->string('id')->primary();
            $t->foreignId('user_id')->nullable()->index();
            $t->string('ip_address', 45)->nullable();
            $t->text('user_agent')->nullable();
            $t->longText('payload');
            $t->integer('last_activity')->index();
        });
        Schema::create('personal_access_tokens', function (Blueprint $t) {
            $t->id();
            $t->morphs('tokenable');
            $t->text('name');
            $t->string('token', 64)->unique();
            $t->text('abilities')->nullable();
            $t->timestamp('last_used_at')->nullable();
            $t->timestamp('expires_at')->nullable()->index();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('users');
    }
};
