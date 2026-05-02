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
        Schema::create('user_recommendations', function (Blueprint $table) {
            $table->uuid('user_id')->primary();
            $table->integer('location_id')->nullable();
            $table->jsonb('suggested_services')->nullable();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('set null');
        });

        // Add the enum column using raw SQL as it's an existing custom type
        \DB::statement('ALTER TABLE user_recommendations ADD COLUMN last_anchor_type service_type');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_recommendations');
    }
};
