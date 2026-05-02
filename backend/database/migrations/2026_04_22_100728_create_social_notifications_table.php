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
        Schema::create('social_notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->comment('Người nhận thông báo');
            $table->uuid('sender_id')->comment('Người gây ra hành động');
            $table->string('type')->comment('like, comment, follow, reply');
            $table->uuid('post_id')->nullable();
            $table->uuid('comment_id')->nullable();
            $table->text('data')->nullable()->comment('Lưu thông tin bổ sung dưới dạng JSON');
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_notifications');
    }
};
