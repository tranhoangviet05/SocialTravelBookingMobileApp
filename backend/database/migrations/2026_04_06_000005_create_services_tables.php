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
        // 1. Tạo các kiểu ENUM cho Services/Media
        DB::statement("DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type') THEN
                CREATE TYPE service_type AS ENUM ('tour', 'hotel', 'homestay', 'vehicle');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_status') THEN
                CREATE TYPE service_status AS ENUM ('draft', 'pending_review', 'active', 'rejected');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
                CREATE TYPE media_type AS ENUM ('image', 'video');
            END IF;
        END $$;");

        // 2. Bảng services
        Schema::create('services', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('provider_id');
            $table->unsignedInteger('category_id')->nullable();
            $table->unsignedInteger('location_id')->nullable();
            
            $table->string('name', 255);
            $table->string('slug', 300)->unique();
            $table->text('description')->nullable();
            
            // Cột Enum sẽ được thêm bằng DB::statement bên dưới
            
            $table->text('rejection_reason')->nullable();
            $table->decimal('base_price', 15, 2);
            $table->string('price_unit', 20)->default('per_person');
            $table->integer('max_guests')->nullable();
            $table->integer('duration_days')->nullable();
            $table->integer('duration_nights')->nullable();
            $table->text('address')->nullable();
            
            // Sử dụng JSONB cho amenities, includes, excludes
            $table->jsonb('amenities')->default('[]');
            $table->jsonb('includes')->default('[]');
            $table->jsonb('excludes')->default('[]');
            
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->integer('total_bookings')->default(0);
            
            // Tags sẽ được thêm bằng DB::statement bên dưới
            
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
            $table->softDeletesTz(); // deleted_at

            // Khóa ngoại
            $table->foreign('provider_id')->references('id')->on('provider_profiles')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('set null');
        });

        // Thêm cột Enum và mảng bằng SQL thuần
        DB::statement('ALTER TABLE services ADD COLUMN type service_type NOT NULL');
        DB::statement('ALTER TABLE services ADD COLUMN status service_status NOT NULL DEFAULT \'draft\'');
        DB::statement('ALTER TABLE services ADD COLUMN tags text[] NOT NULL DEFAULT \'{}\'');

        // 3. Bảng service_media
        Schema::create('service_media', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('service_id');
            $table->text('url');
            // type Enum được thêm bên dưới
            $table->boolean('is_cover')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
        });

        // Thêm cột Enum cho media
        DB::statement('ALTER TABLE service_media ADD COLUMN type media_type NOT NULL DEFAULT \'image\'');

        // 4. Bảng service_schedules
        Schema::create('service_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('service_id');
            $table->integer('day_number');
            $table->string('title', 255)->nullable();
            $table->text('description')->nullable();
            $table->jsonb('activities')->default('[]');
            $table->jsonb('meals')->default('[]');
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
        });

        // 5. Bảng service_availability
        Schema::create('service_availability', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('service_id');
            $table->date('available_date');
            $table->integer('total_slots')->default(0);
            $table->integer('booked_slots')->default(0);
            $table->decimal('price_override', 15, 2)->nullable();
            $table->boolean('is_blocked')->default(false);
            
            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_availability');
        Schema::dropIfExists('service_schedules');
        Schema::dropIfExists('service_media');
        Schema::dropIfExists('services');
        // DB::statement("DROP TYPE IF EXISTS service_type;");
        // DB::statement("DROP TYPE IF EXISTS service_status;");
        // DB::statement("DROP TYPE IF EXISTS media_type;");
    }
};
