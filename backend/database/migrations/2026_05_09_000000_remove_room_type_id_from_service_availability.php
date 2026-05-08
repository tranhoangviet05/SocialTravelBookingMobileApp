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
        Schema::table('service_availability', function (Blueprint $table) {
            // Kiểm tra xem khóa ngoại có tồn tại không trước khi xóa
            // Thường tên khóa ngoại mặc định là service_availability_room_type_id_foreign
            $table->dropForeign(['room_type_id']);
            $table->dropColumn('room_type_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_availability', function (Blueprint $table) {
            $table->uuid('room_type_id')->nullable();
            $table->foreign('room_type_id')->references('id')->on('hotel_room_types')->onDelete('cascade');
        });
    }
};
