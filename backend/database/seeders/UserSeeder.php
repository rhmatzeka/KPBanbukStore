<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ownerRole = \App\Models\Role::where('name', 'owner')->first();
        $adminRole = \App\Models\Role::where('name', 'admin')->first();

        // Create Owner
        \App\Models\User::create([
            'name' => 'Owner',
            'email' => 'owner@gudang.com',
            'password' => bcrypt('password'),
            'role_id' => $ownerRole->id
        ]);

        // Create Admin
        \App\Models\User::create([
            'name' => 'Admin',
            'email' => 'admin@gudang.com',
            'password' => bcrypt('password'),
            'role_id' => $adminRole->id
        ]);
    }
}
