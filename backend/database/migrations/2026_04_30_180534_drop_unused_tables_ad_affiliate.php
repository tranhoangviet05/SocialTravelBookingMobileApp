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
        Schema::dropIfExists('ad_campaigns');
        Schema::dropIfExists('affiliate_clicks');
        
        // Xóa ENUM custom trong Postgres
        \DB::statement('DROP TYPE IF EXISTS ad_status');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Không khôi phục vì đây là bước dọn dẹp bảng không dùng
    }
};
