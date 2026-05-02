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
        // 1. Tạo kiểu ENUM cho provider status
        DB::statement("DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provider_status') THEN
                CREATE TYPE provider_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
            END IF;
        END $$;");

        // 2. Tạo bảng provider_profiles
        Schema::create('provider_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('user_id')->index();
            $table->string('business_name', 255);
            $table->string('business_type', 100)->nullable();
            $table->text('address')->nullable();
            
            // Cột Enum sẽ được thêm bằng DB::statement bên dưới
            
            $table->text('rejection_reason')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->timestampTz('approved_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            // Khóa ngoại
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
        });

        // Thêm cột Enum bằng SQL thuần
        DB::statement('ALTER TABLE provider_profiles ADD COLUMN status provider_status NOT NULL DEFAULT \'pending\'');

        // 3. Tạo bảng categories
        Schema::create('categories', function (Blueprint $table) {
            $table->increments('id'); // SERIAL PRIMARY KEY
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->text('icon_url')->nullable();
            $table->timestampTz('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
        Schema::dropIfExists('provider_profiles');
        // DB::statement("DROP TYPE IF EXISTS provider_status;");
    }
};
