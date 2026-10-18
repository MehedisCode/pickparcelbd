<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parcels', function (Blueprint $t) {
            $t->string('custody_bucket', 30)->default('pickup')->index();
            $t->timestamp('pickup_ready_at')->nullable();
        });
        foreach (['in_transit' => 'custody', 'out_for_delivery' => 'delivery', 'return_pending' => 'return_pending', 'returned' => 'returned', 'delivered' => 'delivered'] as $status => $bucket) {
            DB::table('parcels')->where('status', $status)->update(['custody_bucket' => $bucket]);
        }
    }

    public function down(): void
    {
        Schema::table('parcels', function (Blueprint $t) {
            $t->dropIndex(['custody_bucket']);
            $t->dropColumn(['custody_bucket', 'pickup_ready_at']);
        });
    }
};
