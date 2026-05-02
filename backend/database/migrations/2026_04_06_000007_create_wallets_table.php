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
        // 1. Tạo kiểu ENUM cho Transaction types
        DB::statement("DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
                CREATE TYPE transaction_type AS ENUM ('deposit', 'booking_payment', 'refund', 'commission', 'affiliate_reward');
            END IF;
        END $$;");

        // 2. Bảng wallets
        Schema::create('wallets', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('user_id')->unique();
            $table->decimal('balance', 15, 2)->default(0);
            $table->decimal('locked_balance', 15, 2)->default(0);
            $table->string('currency', 5)->default('VND');
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // 3. Bảng wallet_transactions
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('wallet_id');
            $table->uuid('booking_id')->nullable();
            
            // Cột ENUM transaction type (thêm bằng SQL)
            
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->text('note')->nullable();
            
            $table->string('momo_trans_id', 100)->nullable();
            $table->integer('momo_result_code')->nullable();
            
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('wallet_id')->references('id')->on('wallets');
            $table->foreign('booking_id')->references('id')->on('bookings');
        });

        DB::statement('ALTER TABLE wallet_transactions ADD COLUMN type transaction_type NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');
        // DB::statement("DROP TYPE IF EXISTS transaction_type;");
    }
};
