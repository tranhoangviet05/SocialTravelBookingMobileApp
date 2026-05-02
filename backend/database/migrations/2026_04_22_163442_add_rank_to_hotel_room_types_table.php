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
        Schema::table('hotel_room_types', function (Blueprint $table) {
            $table->string('rank')->default('standard')->after('name'); // standard (bình dân), premium (cao cấp), vip (vip)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hotel_room_types', function (Blueprint $table) {
            $table->dropColumn('rank');
        });
    }
};
