<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $this->call([
            UsersSeeder::class,
            AnnouncementSeeder::class,
            ApartmentsSeeder::class,
            OwnersSeeder::class,
            ServiceSeeder::class,
            ServiceAssignmentSeeder::class,
            TariffSeeder::class,
            MeterTypeSeeder::class,
            MeterSeeder::class,
            MeterReadingSeeder::class,
        ]);
    }
}
