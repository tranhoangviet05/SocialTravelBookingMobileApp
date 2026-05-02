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
        if (!Schema::hasColumn('posts', 'service_id')) {
            Schema::table('posts', function (Blueprint $table) {
                $table->uuid('service_id')->nullable()->after('location_id');
                $table->foreign('service_id')->references('id')->on('services')->onDelete('set null');
            });
        }

        if (!Schema::hasColumn('comments', 'service_id')) {
            Schema::table('comments', function (Blueprint $table) {
                $table->uuid('service_id')->nullable()->after('content');
                $table->foreign('service_id')->references('id')->on('services')->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
            $table->dropColumn('service_id');
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
            $table->dropColumn('service_id');
        });
    }
};
