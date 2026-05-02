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
        Schema::table('coupons', function (Blueprint $table) {
            $table->decimal('min_order_amount', 15, 2)->nullable()->change();
            $table->integer('usage_limit')->nullable()->change();
            $table->integer('per_user_limit')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->decimal('min_order_amount', 15, 2)->nullable(false)->change();
            $table->integer('usage_limit')->nullable(false)->change();
            $table->integer('per_user_limit')->nullable(false)->change();
        });
    }
};
