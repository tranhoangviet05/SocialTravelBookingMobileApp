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
        // 1. Sửa bảng users
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['password', 'phone', 'remember_token']);
            
            // Xóa trường last_promo_sent_at nếu nó tồn tại
            if (Schema::hasColumn('users', 'last_promo_sent_at')) {
                $table->dropColumn('last_promo_sent_at');
            }
        });

        // 2. Tạo bảng tourist_profiles
        Schema::create('tourist_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('user_id')->unique();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('phone_number', 20)->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('nationality', 100)->nullable();
            $table->text('bio')->nullable();
            $table->jsonb('preferences')->nullable(); // Sở thích: núi, biển, ẩm thực...
            $table->jsonb('travel_style')->nullable(); // Phong cách: phượt, nghỉ dưỡng...
            $table->jsonb('emergency_contact')->nullable(); // {name, phone, relation}
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tourist_profiles');

        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable();
            $table->string('phone', 20)->nullable();
            $table->rememberToken();
            $table->timestamp('last_promo_sent_at')->nullable();
        });
    }
};
