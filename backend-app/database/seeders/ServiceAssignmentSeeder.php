<?php

namespace Database\Seeders;

use App\Models\AssignmentTariff;
use App\Models\ServiceAssignment;
use App\Models\Apartment;
use App\Models\Service;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ServiceAssignmentSeeder extends Seeder
{
    public function run()
    {
        // Получаем все услуги по их кодам
        $services = Service::all()->keyBy('code');

        // Получаем все квартиры
        $apartments = Apartment::all();
        $entrances = [1, 2]; // Все подъезды в доме

        // Подъездные услуги (общие для всех квартир в подъезде)
        $entranceServices = [
            'current_repair' => [
                'name' => 'Текущий ремонт подъезда',
                'rates' => [500.0, 800.0] // Индивидуальные тарифы для подъездов
            ],
        ];

        // 1. Создаем подъездные услуги для каждого подъезда
        $this->command->info('Создание подъездных услуг:');
        foreach ($entranceServices as $code => $serviceData) {
            if (!isset($services[$code])) continue;

            foreach ($entrances as $index => $entrance) {
                $assignment = ServiceAssignment::create([
                    'scope' => 'entrance',
                    'entrance' => $entrance,
                    'name' => $services[$code]->name,
                    'type' => $services[$code]->type,
                    'calculation_type' => $services[$code]->calculation_type,
                    'is_active' => true,
                ]);

                // Создаем индивидуальный тариф для этой привязки
                AssignmentTariff::create([
                    'assignment_id' => $assignment->id,
                    'rate' => $serviceData['rates'][$index] ?? 500.0,
                    'unit' => 'm2',
                    'start_date' => Carbon::now()->subMonths(3),
                ]);

                $this->command->info("Подъезд #{$entrance}: услуга '{$serviceData['name']}' добавлена с индивидуальным тарифом");
            }
        }

        // 2. Создаем новую услугу и привязываем услугу установки счетчиков к 2 случайным квартирам
        $selectedApartments = $apartments->random(2);
        $customRates = [1200.0, 1500.0]; // Индивидуальные тарифы для квартир

        $selectedApartments->each(function ($apartment, $index) use ($customRates) {
            $assignment = ServiceAssignment::create([
                'apartment_id' => $apartment->id,
                'name' => 'Установка индивидуальных счетчиков',
                'type' => 'other',
                'calculation_type' => 'fixed',
                'scope' => 'apartment',
                'is_active' => true,
            ]);

            AssignmentTariff::create([
                'assignment_id' => $assignment->id,
                'rate' => $customRates[$index],
                'unit' => 'fixed',
                'start_date' => Carbon::now()->subMonth(),
            ]);


            $this->command->info("Квартира #{$apartment->number} (подъезд {$apartment->entrance}, этаж {$apartment->floor}): услуга добавлена");
        });

        $this->command->info("Создано " . ServiceAssignment::count() . " привязок услуг");
        $this->command->info("Создано " . AssignmentTariff::count() . " индивидуальных тарифов");
    }
}
