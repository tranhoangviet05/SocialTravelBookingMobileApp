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
        Schema::table('tourist_profiles', function (Blueprint $table) {
            // Xóa các trường không cần thiết
            $table->dropColumn([
                'first_name', 
                'last_name', 
                'bio', 
                'travel_style', 
                'preferences', 
                'emergency_contact'
            ]);

            // Thêm trường name mới
            $table->string('name')->nullable()->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tourist_profiles', function (Blueprint $table) {
            $table->dropColumn('name');
            
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->text('bio')->nullable();
            $table->jsonb('travel_style')->nullable();
            $table->jsonb('preferences')->nullable();
            $table->jsonb('emergency_contact')->nullable();
        });
    }
};
