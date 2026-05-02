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
        // Postgres không cho phép ALTER TYPE ADD VALUE trong transaction.
        // Tuy nhiên, chúng ta có thể dùng DB::statement
        // Lưu ý: IF NOT EXISTS chỉ hỗ trợ từ Postgres 10+
        \Illuminate\Support\Facades\DB::statement("ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'sepay'");
        \Illuminate\Support\Facades\DB::statement("ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'vnpay'");
        \Illuminate\Support\Facades\DB::statement("ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'banking'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Postgres không hỗ trợ xóa giá trị khỏi ENUM dễ dàng, thường phải xóa kiểu và tạo lại.
        // Trong trường hợp này, down() có thể để trống hoặc viết logic phức tạp hơn nếu thực sự cần.
    }
};
