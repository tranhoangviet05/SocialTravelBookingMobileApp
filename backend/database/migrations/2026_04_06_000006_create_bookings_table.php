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
        // 1. Tạo các kiểu ENUM cho Bookings & Payments
        DB::statement("DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
                CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'ongoing', 'completed', 'cancelled');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
                CREATE TYPE payment_method AS ENUM ('wallet', 'momo');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
                CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
            END IF;
        END $$;");

        // 2. Bảng bookings
        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->string('booking_code', 20)->unique();
            
            $table->uuid('user_id');
            $table->uuid('service_id');
            $table->uuid('provider_id');
            
            $table->date('check_in_date');
            $table->date('check_out_date')->nullable();
            
            $table->integer('num_adults')->default(1);
            $table->integer('num_children')->default(0);
            
            $table->decimal('unit_price', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->string('coupon_code', 50)->nullable();
            $table->decimal('total_amount', 15, 2);
            
            $table->timestampTz('paid_at')->nullable();
            
            // Task quản lý tài chính (Escrow)
            $table->decimal('escrow_amount', 15, 2)->default(0);
            $table->boolean('released_to_provider')->default(false);
            $table->timestampTz('released_at')->nullable();
            
            // Cột ENUM booking status (sẽ thêm bằng DB::statement)
            
            $table->text('cancel_reason')->nullable();
            $table->timestampTz('cancelled_at')->nullable();
            $table->decimal('refund_amount', 15, 2)->default(0);
            $table->timestampTz('refunded_at')->nullable();
            
            // Thông tin liên hệ
            $table->string('contact_name', 255);
            $table->string('contact_phone', 20);
            $table->string('contact_email', 255)->nullable();
            $table->text('special_requests')->nullable();
            
            $table->uuid('affiliate_post_id')->nullable();
            
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            // Khóa ngoại
            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('service_id')->references('id')->on('services');
            $table->foreign('provider_id')->references('id')->on('provider_profiles');
        });

        // Thêm các cột Enum bằng SQL thuần
        DB::statement('ALTER TABLE bookings ADD COLUMN payment_method payment_method NULL');
        DB::statement('ALTER TABLE bookings ADD COLUMN payment_status payment_status NOT NULL DEFAULT \'pending\'');
        DB::statement('ALTER TABLE bookings ADD COLUMN status booking_status NOT NULL DEFAULT \'pending\'');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
        // DB::statement("DROP TYPE IF EXISTS booking_status;");
        // DB::statement("DROP TYPE IF EXISTS payment_method;");
        // DB::statement("DROP TYPE IF EXISTS payment_status;");
    }
};
