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
        // Kích hoạt extension UUID cho Postgres
        DB::statement('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

        // Tạo các kiểu dữ liệu ENUM tùy chỉnh
        DB::statement("DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
                CREATE TYPE user_role AS ENUM ('tourist', 'provider', 'admin');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
                CREATE TYPE user_status AS ENUM ('active', 'banned', 'pending');
            END IF;
        END $$;");

        Schema::create('users', function (Blueprint $table) {
            // Dùng UUID làm khóa chính
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            
            $table->string('firebase_uid')->unique()->nullable(); // ID từ Firebase
            $table->string('username', 50)->unique();
            $table->string('email')->unique();
            $table->string('password')->nullable(); // Laravel dùng trường này thay cho password_hash
            $table->string('display_name', 100);
            $table->text('avatar_url')->nullable();
            $table->string('phone', 20)->nullable();
            
            // Dùng DB::statement để thêm cột với kiểu dữ liệu tùy chỉnh của Postgres
            // Lưu ý: Chúng ta không dùng $table->addColumn ở đây vì Laravel Grammar không hiểu typeUser_role
            $table->rememberToken();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
        });

        // Thêm các cột Enum bằng SQL thuần
        DB::statement('ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT \'tourist\'');
        DB::statement('ALTER TABLE users ADD COLUMN status user_status NOT NULL DEFAULT \'active\'');


        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestampTz('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            // Lưu ý: Đổi sang uuid('user_id') vì bảng users dùng UUID
            $table->uuid('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
        
        // Xóa ENUM khi rollback (tùy chọn)
        // DB::statement("DROP TYPE IF EXISTS user_role;");
        // DB::statement("DROP TYPE IF EXISTS user_status;");
    }
};
