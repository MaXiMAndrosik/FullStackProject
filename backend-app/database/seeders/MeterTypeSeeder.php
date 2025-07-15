<?php

namespace Database\Seeders;

use App\Models\MeterType;
use Illuminate\Database\Seeder;

class MeterTypeSeeder extends Seeder
{
    public function run()
    {
        $types = [
            [
                'name' => 'Холодная вода',
                'unit' => 'm3',
                'description' => 'Счетчик холодной воды'
            ],
            [
                'name' => 'Горячая вода',
                'unit' => 'm3',
                'description' => 'Счетчик горячей воды'
            ],
            [
                'name' => 'Электричество',
                'unit' => 'kwh',
                'description' => 'Электросчетчик'
            ],
            [
                'name' => 'Газ',
                'unit' => 'm3',
                'description' => 'Газовый счетчик'
            ],
            [
                'name' => 'Отопление',
                'unit' => 'gcal',
                'description' => 'Теплосчетчик'
            ]
        ];

        $meterTypesCount = 0;


        foreach ($types as $type) {
            MeterType::create($type);
            $meterTypesCount++;
        }


        $this->command->info('✅ Типы счетчиков успешно заданы!');
        $this->command->info("- Всего задано типов счетчиков: {$meterTypesCount}");
    }
}
