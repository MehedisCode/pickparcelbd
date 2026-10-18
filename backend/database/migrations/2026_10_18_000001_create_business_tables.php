<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained();
            $t->string('name');
            $t->text('description')->nullable();
            $t->decimal('price', 18, 2);
            $t->decimal('discount_price', 18, 2)->nullable();
            $t->decimal('discount_percent', 5, 2)->nullable();
            $t->text('image_url')->nullable();
            $t->string('category', 80)->default('other')->index();
            $t->boolean('active')->default(true);
            $t->timestamps();
            $t->softDeletes();
            $t->index(['user_id', 'id']);
        });
        Schema::create('follows', function (Blueprint $t) {
            $t->id();
            $t->foreignId('follower_id')->constrained('users');
            $t->foreignId('following_id')->constrained('users');
            $t->timestamps();
            $t->unique(['follower_id', 'following_id']);
        });
        Schema::create('profile_comments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained();
            $t->foreignId('target_user_id')->constrained('users');
            $t->text('body');
            $t->timestamps();
        });
        Schema::create('buyer_blocks', function (Blueprint $t) {
            $t->id();
            $t->foreignId('seller_id')->constrained('users');
            $t->foreignId('buyer_id')->constrained('users');
            $t->timestamps();
            $t->unique(['seller_id', 'buyer_id']);
        });
        Schema::create('cash_memos', function (Blueprint $t) {
            $t->id();
            $t->foreignId('buyer_id')->constrained('users');
            $t->foreignId('seller_id')->constrained('users');
            $t->string('status', 30)->default('draft');
            $t->timestamps();
        });
        Schema::create('orders', function (Blueprint $t) {
            $t->id();
            $t->foreignId('buyer_id')->constrained('users');
            $t->foreignId('seller_id')->constrained('users');
            $t->foreignId('cash_memo_id')->nullable()->unique()->constrained();
            $t->decimal('subtotal', 18, 2);
            $t->decimal('delivery_charge', 18, 2)->default(60);
            $t->decimal('total', 18, 2);
            $t->boolean('cod_enabled')->default(true);
            $t->decimal('cod_amount', 18, 2)->default(0);
            $t->string('status', 30)->default('pending');
            $t->timestamp('confirmed_at')->nullable();
            $t->timestamp('buyer_hidden_at')->nullable();
            $t->timestamp('seller_hidden_at')->nullable();
            $t->timestamps();
            $t->index(['seller_id', 'status', 'id']);
            $t->index(['buyer_id', 'id']);
        });
        Schema::create('order_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('order_id')->constrained();
            $t->foreignId('product_id')->nullable()->constrained();
            $t->string('name');
            $t->decimal('unit_price', 18, 2);
            $t->unsignedInteger('quantity');
            $t->decimal('total', 18, 2);
            $t->timestamps();
        });
        Schema::create('documents', function (Blueprint $t) {
            $t->id();
            $t->foreignId('cash_memo_id')->constrained();
            $t->foreignId('user_id')->constrained();
            $t->string('role', 20);
            $t->text('path');
            $t->string('mime', 100);
            $t->unsignedBigInteger('size');
            $t->timestamps();
            $t->unique(['cash_memo_id', 'role']);
        });
        Schema::create('parcels', function (Blueprint $t) {
            $t->id();
            $t->string('code', 6)->unique();
            $t->foreignId('order_id')->nullable()->unique()->constrained();
            $t->foreignId('sender_id')->constrained('users');
            $t->foreignId('recipient_id')->nullable()->constrained('users');
            foreach (['pickup', 'delivery'] as $side) {
                $t->string($side.'_name');
                $t->string($side.'_phone', 30);
                $t->text($side.'_address');
                $t->string($side.'_district', 100)->index();
                $t->string($side.'_upazila', 100);
            }
            $t->string('source', 20)->default('direct');
            $t->string('status', 30)->default('pending')->index();
            $t->unsignedInteger('weight_grams')->default(1000);
            $t->decimal('delivery_charge', 18, 2);
            $t->boolean('cod_enabled')->default(false);
            $t->decimal('cod_amount', 18, 2)->default(0);
            $t->foreignId('assigned_member_id')->nullable()->constrained('users');
            $t->foreignId('holder_id')->nullable()->constrained('users');
            $t->string('pickup_code_hash')->nullable();
            $t->text('pickup_code_encrypted')->nullable();
            $t->string('delivery_code_hash')->nullable();
            $t->text('delivery_code_encrypted')->nullable();
            $t->timestamp('assigned_at')->nullable();
            $t->timestamp('picked_up_at')->nullable();
            $t->timestamp('delivered_at')->nullable();
            $t->timestamp('returned_at')->nullable();
            $t->string('collection_status', 20)->default('pending');
            $t->decimal('collected_amount', 18, 2)->default(0);
            $t->text('note')->nullable();
            $t->timestamps();
        });
        Schema::create('parcel_events', function (Blueprint $t) {
            $t->id();
            $t->foreignId('parcel_id')->constrained();
            $t->foreignId('actor_id')->nullable()->constrained('users');
            $t->string('type', 50);
            $t->text('note')->nullable();
            $t->json('metadata')->nullable();
            $t->timestamp('created_at')->useCurrent();
            $t->index(['parcel_id', 'id']);
        });
        Schema::create('parcel_messages', function (Blueprint $t) {
            $t->id();
            $t->foreignId('parcel_id')->constrained();
            $t->foreignId('user_id')->constrained();
            $t->text('body');
            $t->timestamps();
        });
        Schema::create('transfers', function (Blueprint $t) {
            $t->id();
            $t->string('code', 20)->unique();
            $t->string('token_hash', 64)->unique();
            $t->text('token_encrypted');
            $t->foreignId('sender_id')->constrained('users');
            $t->foreignId('receiver_id')->nullable()->constrained('users');
            $t->string('status', 20)->default('pending')->index();
            $t->timestamp('expires_at');
            $t->timestamp('accepted_at')->nullable();
            $t->text('note')->nullable();
            $t->timestamps();
        });
        Schema::create('transfer_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('transfer_id')->constrained();
            $t->foreignId('parcel_id')->constrained();
            $t->timestamp('received_at')->nullable();
            $t->decimal('collection_amount', 18, 2)->default(0);
            $t->timestamp('collection_handed_over_at')->nullable();
            $t->unique(['transfer_id', 'parcel_id']);
        });
        Schema::create('parcel_returns', function (Blueprint $t) {
            $t->id();
            $t->foreignId('parcel_id')->constrained();
            $t->foreignId('requested_by')->constrained('users');
            $t->foreignId('accepted_by')->nullable()->constrained('users');
            $t->string('status', 20)->default('pending');
            $t->text('reason');
            $t->timestamp('accepted_at')->nullable();
            $t->timestamps();
        });
        Schema::create('commission_rules', function (Blueprint $t) {
            $t->id();
            $t->string('district', 100)->unique();
            $t->decimal('rider_percent', 5, 2)->default(40);
            $t->decimal('agent_percent', 5, 2)->default(30);
            $t->decimal('company_percent', 5, 2)->default(30);
            $t->timestamps();
        });
        Schema::create('commissions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('parcel_id')->unique()->constrained();
            $t->string('district', 100)->index();
            $t->decimal('delivery_charge', 18, 2);
            $t->decimal('member_amount', 18, 2);
            $t->decimal('company_amount', 18, 2);
            $t->timestamp('company_settled_at')->nullable();
            $t->timestamps();
        });
        Schema::create('commission_participants', function (Blueprint $t) {
            $t->id();
            $t->foreignId('commission_id')->constrained();
            $t->foreignId('user_id')->constrained();
            $t->decimal('amount', 18, 2);
            $t->timestamp('settled_at')->nullable();
            $t->unique(['commission_id', 'user_id']);
        });
        Schema::create('settlements', function (Blueprint $t) {
            $t->id();
            $t->string('reference', 30)->unique();
            $t->string('type', 30);
            $t->foreignId('user_id')->nullable()->constrained();
            $t->foreignId('created_by')->constrained('users');
            $t->string('district', 100)->index();
            $t->decimal('amount', 18, 2);
            $t->text('note')->nullable();
            $t->timestamps();
        });
        Schema::create('settlement_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('settlement_id')->constrained();
            $t->foreignId('parcel_id')->constrained();
            $t->foreignId('beneficiary_id')->nullable()->constrained('users');
            $t->string('type', 30);
            $t->decimal('amount', 18, 2);
            $t->string('operation_key', 150)->unique();
        });
        Schema::create('wallet_transactions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained();
            $t->foreignId('parcel_id')->nullable()->constrained();
            $t->foreignId('settlement_id')->nullable()->constrained();
            $t->foreignId('created_by')->nullable()->constrained('users');
            $t->decimal('amount', 18, 2);
            $t->decimal('balance_after', 18, 2);
            $t->string('type', 40);
            $t->string('operation_key', 150)->unique();
            $t->text('note')->nullable();
            $t->timestamp('created_at')->useCurrent();
        });
        Schema::create('messages', function (Blueprint $t) {
            $t->id();
            $t->foreignId('sender_id')->constrained('users');
            $t->foreignId('receiver_id')->constrained('users');
            $t->foreignId('order_id')->nullable()->constrained();
            $t->text('body');
            $t->timestamp('read_at')->nullable();
            $t->boolean('sender_deleted')->default(false);
            $t->boolean('receiver_deleted')->default(false);
            $t->timestamps();
            $t->index(['receiver_id', 'sender_id', 'id']);
        });
        Schema::create('notifications', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained();
            $t->foreignId('sender_id')->nullable()->constrained('users');
            $t->string('type', 60);
            $t->string('title');
            $t->text('body');
            $t->string('url', 500)->nullable();
            $t->timestamp('read_at')->nullable();
            $t->timestamps();
            $t->index(['user_id', 'read_at', 'id']);
        });
        Schema::create('device_tokens', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained();
            $t->text('token');
            $t->string('token_hash', 64)->unique();
            $t->boolean('active')->default(true);
            $t->timestamps();
        });
        Schema::create('push_deliveries', function (Blueprint $t) {
            $t->id();
            $t->foreignId('notification_id')->constrained();
            $t->foreignId('device_token_id')->constrained();
            $t->string('status', 20)->default('pending');
            $t->unsignedInteger('attempts')->default(0);
            $t->timestamp('sent_at')->nullable();
            $t->text('last_error')->nullable();
            $t->timestamps();
            $t->unique(['notification_id', 'device_token_id']);
        });
        Schema::create('driver_states', function (Blueprint $t) {
            $t->foreignId('user_id')->primary()->constrained();
            $t->boolean('available')->default(false);
            $t->decimal('latitude', 10, 7)->nullable();
            $t->decimal('longitude', 10, 7)->nullable();
            $t->timestamp('location_updated_at')->nullable();
            $t->timestamps();
        });
        Schema::create('rides', function (Blueprint $t) {
            $t->id();
            $t->foreignId('passenger_id')->constrained('users');
            $t->foreignId('driver_id')->nullable()->constrained('users');
            $t->string('pickup', 500);
            $t->string('destination', 500);
            $t->decimal('pickup_lat', 10, 7);
            $t->decimal('pickup_lng', 10, 7);
            $t->string('status', 20)->default('searching')->index();
            $t->timestamp('accepted_at')->nullable();
            $t->timestamp('completed_at')->nullable();
            $t->timestamps();
        });
        Schema::create('audit_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('actor_id')->nullable()->constrained('users');
            $t->string('action', 100);
            $t->string('resource_type', 60)->nullable();
            $t->string('resource_id', 60)->nullable();
            $t->string('district', 100)->nullable()->index();
            $t->json('before')->nullable();
            $t->json('after')->nullable();
            $t->text('reason')->nullable();
            $t->timestamp('created_at')->useCurrent();
        });
        Schema::create('audit_runs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('actor_id')->constrained('users');
            $t->string('type', 80);
            $t->string('district', 100)->index();
            $t->string('status', 20)->default('completed');
            $t->json('summary');
            $t->timestamps();
        });
        Schema::create('audit_findings', function (Blueprint $t) {
            $t->id();
            $t->foreignId('audit_run_id')->constrained();
            $t->foreignId('parcel_id')->nullable()->constrained();
            $t->string('type', 80);
            $t->string('severity', 20);
            $t->text('details');
            $t->string('status', 20)->default('open');
            $t->timestamps();
        });
        Schema::create('safety_snapshots', function (Blueprint $t) {
            $t->id();
            $t->foreignId('parcel_id')->constrained();
            $t->foreignId('created_by')->constrained('users');
            $t->string('district', 100)->index();
            $t->json('payload');
            $t->text('note')->nullable();
            $t->timestamps();
        });
        Schema::create('settings', function (Blueprint $t) {
            $t->string('key')->primary();
            $t->json('value');
            $t->timestamps();
        });
        Schema::create('legacy_mappings', function (Blueprint $t) {
            $t->id();
            $t->string('source_table', 100);
            $t->string('source_id', 100);
            $t->string('target_table', 100);
            $t->unsignedBigInteger('target_id');
            $t->timestamps();
            $t->unique(['source_table', 'source_id']);
        });
    }

    public function down(): void
    {
        foreach (array_reverse(['products', 'follows', 'profile_comments', 'buyer_blocks', 'cash_memos', 'orders', 'order_items', 'documents', 'parcels', 'parcel_events', 'parcel_messages', 'transfers', 'transfer_items', 'parcel_returns', 'commission_rules', 'commissions', 'commission_participants', 'settlements', 'settlement_items', 'wallet_transactions', 'messages', 'notifications', 'device_tokens', 'push_deliveries', 'driver_states', 'rides', 'audit_logs', 'audit_runs', 'audit_findings', 'safety_snapshots', 'settings', 'legacy_mappings']) as $table) {
            Schema::dropIfExists($table);
        }
    }
};
