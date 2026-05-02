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
        // Thêm cột cho bảng locations
        Schema::table('locations', function (Blueprint $table) {
            if (!Schema::hasColumn('locations', 'image_url')) {
                $table->string('image_url')->nullable()->after('slug');
            }
            if (!Schema::hasColumn('locations', 'country_code')) {
                $table->string('country_code', 5)->default('VN')->after('image_url');
            }
            if (!Schema::hasColumn('locations', 'description')) {
                $table->text('description')->nullable()->after('country_code');
            }
        });

        // Thêm cột cho bảng categories
        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'icon')) {
                $table->string('icon')->default('Tag')->after('name');
            }
            if (!Schema::hasColumn('categories', 'description')) {
                $table->text('description')->nullable()->after('icon');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn(['image_url', 'country_code', 'description']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['icon', 'description']);
        });
    }
};
