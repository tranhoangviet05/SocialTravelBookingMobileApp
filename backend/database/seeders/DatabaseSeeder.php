<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@socialtravelbooking.com'],
            [
                'display_name' => 'Admin',
                'email'        => 'admin@socialtravelbooking.com',
                'password'     => Hash::make('password'),
                'role'         => 'admin',
                'status'       => 'active',
            ]
        );

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'display_name' => 'Test User',
                'email'        => 'test@example.com',
                'password'     => Hash::make('password'),
                'role'         => 'tourist',
                'status'       => 'active',
            ]
        );
    }
}
