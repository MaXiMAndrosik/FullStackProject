<?php

namespace Database\Seeders;

use App\Models\Apartment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class ApartmentsSeeder extends Seeder
{
    public function run()
    {
        // Очищаем таблицу
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('apartments')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $faker = Faker::create('ru_RU');
        $now = now();
        $apartments = [];

        // Создаем 60 квартир
        for ($i = 1; $i <= 60; $i++) {
            $apartments[] = [
                'number' => $i,
                'area' => $faker->numberBetween(50, 100),
                'floor' => $faker->numberBetween(1, 5),
                'entrance' => $faker->numberBetween(1, 4),
                'rooms' => $faker->numberBetween(1, 4),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        Apartment::insert($apartments);

        $this->command->info("Создано 60 записей квартир");
    }
}
