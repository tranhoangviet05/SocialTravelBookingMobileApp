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
        Schema::create('locations', function (Blueprint $table) {
            // SERIAL PRIMARY KEY trong Postgres tương ứng với increments() trong Laravel
            $table->increments('id');
            
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            
            // parent_id tham chiếu đến chính bảng locations
            $table->unsignedInteger('parent_id')->nullable();
            $table->foreign('parent_id')->references('id')->on('locations')->onDelete('set null');
            
            $table->text('image_url')->nullable();
            $table->boolean('is_popular')->default(false);
            
            // TIMESTAMPTZ DEFAULT NOW()
            $table->timestampTz('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
