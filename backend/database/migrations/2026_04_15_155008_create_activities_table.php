<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Bảng activities: Ghi lại hoạt động của người dùng để hiển thị trên trang profile.
     * Khác với user_behaviors (dùng cho recommendation engine), bảng này phục vụ UI.
     *
     * action_type:
     *  - created_post   : Đã đăng một bài viết
     *  - liked_post     : Đã thích một bài viết
     *  - commented_post : Đã bình luận trên một bài viết
     *  - followed_user  : Đã theo dõi một người dùng
     */
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));

            // Người thực hiện hành động
            $table->uuid('user_id');

            // Loại hành động
            $table->string('action_type', 30);
            // created_post | liked_post | commented_post | followed_user

            // Đối tượng liên quan (polymorphic đơn giản)
            $table->uuid('subject_id')->nullable();
            // ID của post, comment, hoặc user liên quan
            $table->string('subject_type', 30)->nullable();
            // 'post' | 'comment' | 'user'

            // Snapshot dữ liệu để hiển thị nhanh (không cần join nhiều bảng)
            // Ví dụ: { "post_content": "Đà Nẵng đẹp quá!", "post_image": "...", "comment_text": "Tuyệt!" }
            $table->jsonb('snapshot')->nullable();

            // Cho phép ẩn một số hoạt động nhạy cảm
            $table->boolean('is_public')->default(true);

            $table->timestampTz('created_at')->useCurrent();

            // Foreign key
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // Index để query nhanh theo user và thời gian
            $table->index(['user_id', 'created_at'], 'activities_user_time_idx');
            $table->index(['user_id', 'action_type'], 'activities_user_action_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
