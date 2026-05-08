<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'escrow_amount',
                'released_to_provider',
                'released_at',
                'refund_amount',
                'refunded_at'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('escrow_amount', 15, 2)->default(0)->after('total_amount');
            $table->boolean('released_to_provider')->default(false)->after('escrow_amount');
            $table->timestamp('released_at')->nullable()->after('released_to_provider');
            $table->decimal('refund_amount', 15, 2)->default(0)->after('released_at');
            $table->timestamp('refunded_at')->nullable()->after('refund_amount');
        });
    }
};
