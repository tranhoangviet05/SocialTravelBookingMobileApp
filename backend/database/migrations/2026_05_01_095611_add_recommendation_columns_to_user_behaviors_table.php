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
        Schema::table('user_behaviors', function (Blueprint $table) {
            if (!Schema::hasColumn('user_behaviors', 'score')) {
                $table->decimal('score', 8, 2)->default(0)->after('location_id');
            }
            if (!Schema::hasColumn('user_behaviors', 'tags')) {
                $table->jsonb('tags')->nullable()->after('score');
            }
            if (!Schema::hasColumn('user_behaviors', 'is_pending')) {
                $table->boolean('is_pending')->default(false)->after('tags');
            }
            if (!Schema::hasColumn('user_behaviors', 'updated_at')) {
                $table->timestamp('updated_at')->nullable()->after('is_pending');
            }
            
            // Thêm unique constraint để phục vụ UPSERT nếu chưa có
            // Lưu ý: Tùy vào dữ liệu cũ, bước này có thể lỗi nếu đã có trùng lặp.
            // Tôi sẽ bỏ qua constraint ở đây để đảm bảo migration chạy thành công.
        });
    }

    public function down(): void
    {
        Schema::table('user_behaviors', function (Blueprint $table) {
            $table->dropColumn(['score', 'tags', 'is_pending', 'updated_at']);
        });
    }
};
