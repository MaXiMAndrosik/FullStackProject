<?php

namespace Database\Seeders;

use App\Models\Owner;
use App\Models\User;
use App\Models\Apartment;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class OwnersSeeder extends Seeder
{
    public function run()
    {
        // Очищаем таблицу перед заполнением
        DB::table('owners')->truncate();

        // Инициализируем Faker для русских имен
        $faker = Faker::create('ru_RU');

        // Получаем всех пользователей с ролью owner
        $ownerUsers = User::where('role', 'owner')->get();

        // Проверяем, есть ли пользователи для заполнения
        if ($ownerUsers->isEmpty()) {
            $this->command->info('Нет пользователей с ролью owner для создания владельцев');
            return;
        }

        $now = Carbon::now();
        $ownersData = [];

        // Получаем квартиры
        $apartments = Apartment::all();

        if ($apartments->isEmpty()) {
            $this->command->error('Сначала запустите ApartmentsSeeder!');
            return;
        }

        // Для каждого пользователя-собственника создаем запись владельца
        foreach ($ownerUsers as $index => $user) {
            $birthDate = Carbon::createFromDate(rand(1950, 1990), rand(1, 12), rand(1, 28));

            // Генерируем случайные ФИО
            $gender = rand(0, 1) ? 'male' : 'female';
            $lastName = $faker->lastName($gender);
            $firstName = $faker->firstName($gender);
            $patronymic = $faker->middleName($gender);

            // Берем квартиру по порядку (1-15)
            $apartment = $apartments[$index] ?? null;

            if (!$apartment) {
                continue;
            }

            $ownersData[] = [
                'user_id' => $user->id,
                'last_name' => $lastName,
                'first_name' => $firstName,
                'patronymic' => $patronymic,
                'birth_date' => $birthDate,
                'phone' => '+37529' . rand(1000000, 9999999),
                'telegram' => '@' . Str::slug($faker->userName),
                'apartment_id' => $apartment->id, // Номер квартиры
                'ownership_start_date' => $now->subYears(rand(1, 10)),
                'ownership_end_date' => null,
                'is_verified' => true,
                'verified_at' => fake()->dateTimeBetween('-15 years', 'now'),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // Создаем еще 5 записей собственников не привязанных к пользователям
        for ($i = 15; $i < 20; $i++) {
            $birthDate = Carbon::createFromDate(rand(1950, 1990), rand(1, 12), rand(1, 28));

            $gender = rand(0, 1) ? 'male' : 'female';
            $lastName = $faker->lastName($gender);
            $firstName = $faker->firstName($gender);
            $patronymic = $faker->middleName($gender);

            $apartment = $apartments[$i] ?? null;

            if (!$apartment) {
                continue;
            }

            $ownersData[] = [
                'user_id' => null,
                'last_name' => $lastName,
                'first_name' => $firstName,
                'patronymic' => $patronymic,
                'birth_date' => null,
                'phone' => null,
                'telegram' => null,
                'apartment_id' => $apartment->id,
                'ownership_start_date' => $now->subYears(rand(1, 15)),
                'ownership_end_date' => null,
                'is_verified' => false,
                'verified_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }


        // Вставляем данные пачкой
        Owner::insert($ownersData);

        $totalCount = count($ownersData);
        $linkedCount = $ownerUsers->count();
        $unlinkedCount = 5;

        $this->command->info("Создано {$totalCount} записей владельцев квартир:");
        $this->command->info("- Привязано к пользователям: {$linkedCount}");
        $this->command->info("- Без привязки к пользователям: {$unlinkedCount}");

        if (!$ownerUsers->isEmpty()) {
            $this->command->info('Привязанные пользователи:');
            foreach ($ownerUsers as $user) {
                $this->command->info("  - {$user->email}");
            }
        }
    }
}
