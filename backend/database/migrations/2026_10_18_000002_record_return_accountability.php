<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parcel_returns', function (Blueprint $t) {
            $t->foreignId('member_id')->nullable()->constrained('users');
            $t->decimal('accountability_amount', 18, 2)->default(0);
            $t->timestamp('company_received_at')->nullable();
            $t->foreignId('received_by')->nullable()->constrained('users');
        });
    }

    public function down(): void
    {
        Schema::table('parcel_returns', function (Blueprint $t) {
            $t->dropConstrainedForeignId('member_id');
            $t->dropConstrainedForeignId('received_by');
            $t->dropColumn(['accountability_amount', 'company_received_at']);
        });
    }
};
