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
        // 1. Tạo các kiểu ENUM còn lại
        DB::statement("DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type') THEN
                CREATE TYPE discount_type AS ENUM ('percent', 'fixed');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ad_status') THEN
                CREATE TYPE ad_status AS ENUM ('pending', 'active', 'expired', 'paused');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_type') THEN
                CREATE TYPE report_type AS ENUM ('spam', 'fraud', 'inappropriate', 'misleading');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
                CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');
            END IF;
        END $$;");

        // 2. Bảng reviews
        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('booking_id')->unique()->nullable();
            $table->uuid('service_id');
            $table->uuid('user_id');
            
            $table->smallInteger('rating'); // 1-5
            $table->smallInteger('rating_cleanliness')->nullable();
            $table->smallInteger('rating_service')->nullable();
            $table->smallInteger('rating_value')->nullable();
            
            $table->text('content')->nullable();
            // $table->addColumn('text[]', 'images')->default('{}'); (thêm bằng SQL)
            $table->boolean('is_verified')->default(false);
            $table->text('provider_reply')->nullable();
            $table->timestampTz('provider_reply_at')->nullable();
            
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->foreign('booking_id')->references('id')->on('bookings');
            $table->foreign('service_id')->references('id')->on('services');
            $table->foreign('user_id')->references('id')->on('users');
        });
        DB::statement('ALTER TABLE reviews ADD COLUMN images text[] NOT NULL DEFAULT \'{}\'');

        // 3. Bảng coupons
        Schema::create('coupons', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->string('code', 50)->unique();
            // $table->addColumn('discount_type', 'type'); (thêm bằng SQL)
            $table->decimal('discount_value', 15, 2);
            $table->decimal('min_order_amount', 15, 2)->default(0);
            $table->integer('usage_limit')->nullable();
            $table->integer('used_count')->default(0);
            $table->integer('per_user_limit')->default(1);
            $table->timestampTz('valid_from')->nullable();
            $table->timestampTz('valid_until')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('created_by')->references('id')->on('users');
        });
        DB::statement('ALTER TABLE coupons ADD COLUMN type discount_type NOT NULL');

        // 4. Bảng ad_campaigns
        Schema::create('ad_campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('provider_id');
            $table->string('post_id')->nullable(); // Firestore ID
            $table->uuid('service_id')->nullable();
            // $table->addColumn('ad_status', 'status')->default('pending'); (thêm bằng SQL)
            
            $table->decimal('budget', 15, 2);
            $table->decimal('spent', 15, 2)->default(0);
            $table->integer('duration_days')->default(7);
            $table->timestampTz('start_date')->nullable();
            $table->timestampTz('end_date')->nullable();
            
            $table->integer('impression_count')->default(0);
            $table->integer('click_count')->default(0);
            
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->foreign('provider_id')->references('id')->on('provider_profiles');
            $table->foreign('service_id')->references('id')->on('services');
        });
        DB::statement('ALTER TABLE ad_campaigns ADD COLUMN status ad_status NOT NULL DEFAULT \'pending\'');

        // 5. Bảng affiliate_clicks
        Schema::create('affiliate_clicks', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->string('post_id');
            $table->uuid('service_id');
            $table->uuid('affiliate_user_id');
            $table->uuid('clicker_user_id')->nullable();
            $table->string('session_token', 255);
            $table->boolean('converted')->default(false);
            $table->uuid('booking_id')->nullable();
            $table->decimal('commission_amount', 15, 2)->default(0);
            $table->boolean('commission_paid')->default(false);
            $table->timestampTz('clicked_at')->useCurrent();
            $table->timestampTz('converted_at')->nullable();

            $table->foreign('service_id')->references('id')->on('services');
            $table->foreign('affiliate_user_id')->references('id')->on('users');
            $table->foreign('clicker_user_id')->references('id')->on('users');
            $table->foreign('booking_id')->references('id')->on('bookings');
        });

        // 6. Bảng reports
        Schema::create('reports', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('reporter_id');
            $table->string('post_id')->nullable();
            $table->uuid('service_id')->nullable();
            // $table->addColumn('report_type', 'type'); (thêm bằng SQL)
            // $table->addColumn('report_status', 'status')->default('pending'); (thêm bằng SQL)
            $table->text('description')->nullable();
            $table->uuid('reviewed_by')->nullable();
            $table->timestampTz('reviewed_at')->nullable();
            $table->text('resolution_note')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('reporter_id')->references('id')->on('users');
            $table->foreign('reviewed_by')->references('id')->on('users');
            $table->foreign('service_id')->references('id')->on('services');
        });
        DB::statement('ALTER TABLE reports ADD COLUMN type report_type NOT NULL');
        DB::statement('ALTER TABLE reports ADD COLUMN status report_status NOT NULL DEFAULT \'pending\'');

        // 7. Bảng system_settings
        Schema::create('system_settings', function (Blueprint $table) {
            $table->string('key', 100)->primary();
            $table->text('value');
            $table->string('type', 20)->default('string');
            $table->text('description')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestampTz('updated_at')->useCurrent();

            $table->foreign('updated_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('reports');
        Schema::dropIfExists('affiliate_clicks');
        Schema::dropIfExists('ad_campaigns');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('reviews');
    }
};
