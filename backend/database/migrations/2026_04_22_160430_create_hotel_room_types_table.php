<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tạo bảng Loại phòng khách sạn
        Schema::create('hotel_room_types', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('service_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('base_price', 15, 2);
            $table->integer('total_rooms')->default(1);
            $table->integer('capacity_adults')->default(2);
            $table->integer('capacity_children')->default(0);
            $table->jsonb('amenities')->default('[]');
            $table->jsonb('images')->default('[]');
            $table->string('status')->default('active'); // active, inactive
            $table->timestamps();

            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
        });

        // 2. Thêm room_type_id vào bảng bookings
        Schema::table('bookings', function (Blueprint $table) {
            $table->uuid('room_type_id')->nullable()->after('service_id');
            $table->foreign('room_type_id')->references('id')->on('hotel_room_types')->onDelete('set null');
        });

        // 3. Thêm room_type_id vào bảng service_availability để quản lý số phòng trống theo loại
        Schema::table('service_availability', function (Blueprint $table) {
            $table->uuid('room_type_id')->nullable()->after('service_id');
            $table->foreign('room_type_id')->references('id')->on('hotel_room_types')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_availability', function (Blueprint $table) {
            $table->dropForeign(['room_type_id']);
            $table->dropColumn('room_type_id');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['room_type_id']);
            $table->dropColumn('room_type_id');
        });

        Schema::dropIfExists('hotel_room_types');
    }
};
