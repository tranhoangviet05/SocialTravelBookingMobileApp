<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Tạo bảng social_profiles ─────────────────────────────────────
        Schema::create('social_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));

            // 1-1 với users (mỗi user chỉ có 1 hồ sơ mạng xã hội)
            $table->uuid('user_id')->unique();

            // Thông tin hồ sơ
            $table->string('username', 30)->unique();
            $table->text('bio')->nullable();
            $table->text('cover_photo_url')->nullable();   // Ảnh bìa trang cá nhân
            $table->string('website_url', 255)->nullable(); // Link cá nhân
            $table->boolean('is_verified')->default(false);// Tick xanh

            // Bộ đếm (denormalized để query nhanh)
            $table->unsignedInteger('followers_count')->default(0);
            $table->unsignedInteger('following_count')->default(0);
            $table->unsignedInteger('posts_count')->default(0);

            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // ── 2. Xóa các cột không cần thiết khỏi bảng users ──────────────────
        Schema::table('users', function (Blueprint $table) {
            // Xóa username nếu tồn tại
            if (Schema::hasColumn('users', 'username')) {
                // Tìm và xóa unique constraint trước (PostgreSQL)
                DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_unique');
                $table->dropColumn('username');
            }
            // Xóa bio nếu tồn tại
            if (Schema::hasColumn('users', 'bio')) {
                $table->dropColumn('bio');
            }
            // Xóa social_status nếu tồn tại
            if (Schema::hasColumn('users', 'social_status')) {
                $table->dropColumn('social_status');
            }
        });
    }

    public function down(): void
    {
        // Khôi phục các cột vào users
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 30)->nullable()->unique();
            $table->text('bio')->nullable();
        });

        Schema::dropIfExists('social_profiles');
    }
};
