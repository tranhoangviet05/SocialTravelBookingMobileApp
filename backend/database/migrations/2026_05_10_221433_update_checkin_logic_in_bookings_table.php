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
            // Xóa các cột cũ nếu cần hoặc giữ nguyên nếu đã có
            // Ở đây tôi sẽ thêm các cột mới theo yêu cầu
            $table->timestamp('tourist_check_in_at')->nullable()->after('checked_in_at');
            $table->boolean('is_checked_in')->default(false)->after('tourist_check_in_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['tourist_check_in_at', 'is_checked_in']);
        });
    }
};
