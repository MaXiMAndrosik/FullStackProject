<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class UsersSeeder extends Seeder
{
    public function run()
    {
        // Очищаем таблицу перед заполнением (опционально)
        // User::truncate();

        // Создаем администратора
        User::create([
            'name' => 'Test Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'verification_status' => 'verified',
            'email_verified_at' => now(),
            'verification_sent_at' => now()->subMinutes(5),
            'remember_token' => Str::random(10),
        ]);

        // Создаем собственника
        User::create([
            'name' => 'Test Owner',
            'email' => 'owner@example.com',
            'password' => Hash::make('password'),
            'role' => 'owner',
            'verification_status' => 'verified',
            'email_verified_at' => now(),
            'verification_sent_at' => now()->subMinutes(10),
            'remember_token' => Str::random(10),
        ]);

        // Создаем пользователя
        User::create([
            'name' => 'Test User',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'email_verified_at' => now(),
            'verification_sent_at' => now()->subMinutes(10),
            'remember_token' => Str::random(10),
        ]);

        // Создаем 10 обычных собственников
        for ($i = 2; $i <= 11; $i++) {
            User::create([
                'name' => "Owner {$i}",
                'email' => "owner{$i}@example.com",
                'password' => Hash::make('password'),
                'role' => 'owner',
                'verification_status' => 'verified',
                'email_verified_at' => now()->subDays($i),
                'verification_sent_at' => now()->subDays($i)->subMinutes(15),
                'remember_token' => Str::random(10),
            ]);
        }

        // Создаем 5 обычных пользователей
        for ($i = 2; $i <= 6; $i++) {
            User::create([
                'name' => "User {$i}",
                'email' => "user{$i}@example.com",
                'password' => Hash::make('password'),
                'role' => 'user',
                'email_verified_at' => now()->subDays($i),
                'verification_sent_at' => now()->subDays($i)->subMinutes(15),
                'remember_token' => Str::random(10),
            ]);
        }

        $this->command->info('Пользователи успешно созданы:');
        $this->command->info('- 1 администратор (admin@example.com)');
        $this->command->info('- 1 пользователь (user@example.com)');
        $this->command->info('- 1 собственник (owner@example.com)');
        $this->command->info('- 10 собственников (owner2@example.com - owner11@example.com)');
        $this->command->info('- 5 пользователей (user2@example.com - user6@example.com)');
        $this->command->info('Пароль для всех: password');
    }
}
