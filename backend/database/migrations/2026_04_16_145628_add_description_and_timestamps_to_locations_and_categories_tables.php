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
        Schema::table('locations', function (Blueprint $table) {
            if (!Schema::hasColumn('locations', 'description')) {
                $table->text('description')->nullable();
            }
            if (!Schema::hasColumn('locations', 'updated_at')) {
                $table->timestampTz('updated_at')->nullable();
            }
        });

        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'description')) {
                $table->text('description')->nullable();
            }
            if (!Schema::hasColumn('categories', 'updated_at')) {
                $table->timestampTz('updated_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn(['description', 'updated_at']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['description', 'updated_at']);
        });
    }
};
