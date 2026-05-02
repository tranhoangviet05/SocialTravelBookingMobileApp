<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Tạo ENUM types mới (media_type đã tồn tại từ services migration – bỏ qua)
        DB::statement("DO \$\$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_visibility') THEN
                CREATE TYPE post_visibility AS ENUM ('public', 'private');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tag_type') THEN
                CREATE TYPE tag_type AS ENUM ('location', 'category', 'activity');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'behavior_action') THEN
                CREATE TYPE behavior_action AS ENUM ('view_post', 'like_post', 'comment_post', 'click_affiliate', 'save_post', 'follow_user');
            END IF;
        END \$\$;");

        // ── 1. tags ──────────────────────────────────────────────────────────
        Schema::create('tags', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name', 100)->unique();
            $table->string('display_name', 100);
            $table->string('type', 20)->default('category'); // location | category | activity
            $table->timestampTz('created_at')->useCurrent();
        });

        // ── 2. posts ─────────────────────────────────────────────────────────
        // locations.id = unsignedInteger, services.id = uuid
        Schema::create('posts', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('user_id');
            $table->text('content')->nullable();
            $table->unsignedInteger('location_id')->nullable(); // FK → locations(int)
            $table->string('visibility', 10)->default('public');
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
            $table->timestampTz('deleted_at')->nullable();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('set null');
        });

        // ── 3. post_media ────────────────────────────────────────────────────
        Schema::create('post_media', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('post_id');
            $table->text('url');
            $table->string('type', 10)->default('image'); // image | video
            $table->unsignedSmallInteger('order')->default(0);
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
        });

        // ── 4. post_tags (pivot) ─────────────────────────────────────────────
        Schema::create('post_tags', function (Blueprint $table) {
            $table->uuid('post_id');
            $table->unsignedBigInteger('tag_id');
            $table->primary(['post_id', 'tag_id']);

            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            $table->foreign('tag_id')->references('id')->on('tags')->onDelete('cascade');
        });

        // ── 5. likes ─────────────────────────────────────────────────────────
        Schema::create('likes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('user_id');
            $table->uuid('post_id');
            $table->timestampTz('created_at')->useCurrent();

            $table->unique(['user_id', 'post_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
        });

        // ── 6. comments ──────────────────────────────────────────────────────
        Schema::create('comments', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('post_id');
            $table->uuid('user_id');
            $table->text('content');
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // ── 7. follows ───────────────────────────────────────────────────────
        Schema::create('follows', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('follower_id');
            $table->uuid('following_id');
            $table->timestampTz('created_at')->useCurrent();

            $table->unique(['follower_id', 'following_id']);
            $table->foreign('follower_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('following_id')->references('id')->on('users')->onDelete('cascade');
        });

        // ── 8. user_behaviors ────────────────────────────────────────────────
        Schema::create('user_behaviors', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('user_id');
            $table->string('action_type', 30); // view_post | like_post | comment_post | click_affiliate | save_post | follow_user
            $table->uuid('post_id')->nullable();
            $table->unsignedBigInteger('tag_id')->nullable();
            $table->unsignedInteger('location_id')->nullable(); // FK → locations(int)
            $table->uuid('service_id')->nullable();             // FK → services(uuid)
            $table->jsonb('metadata')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('set null');
            $table->foreign('tag_id')->references('id')->on('tags')->onDelete('set null');
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('set null');
            $table->foreign('service_id')->references('id')->on('services')->onDelete('set null');

            // Index cho recommendation queries
            $table->index(['user_id', 'action_type'], 'ub_user_action_idx');
            $table->index(['user_id', 'location_id'], 'ub_user_location_idx');
            $table->index(['user_id', 'tag_id'], 'ub_user_tag_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_behaviors');
        Schema::dropIfExists('follows');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('likes');
        Schema::dropIfExists('post_tags');
        Schema::dropIfExists('post_media');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('tags');

        DB::statement('DROP TYPE IF EXISTS behavior_action');
        DB::statement('DROP TYPE IF EXISTS tag_type');
        DB::statement('DROP TYPE IF EXISTS post_visibility');
    }
};
