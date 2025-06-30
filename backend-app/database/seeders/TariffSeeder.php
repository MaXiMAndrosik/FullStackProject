<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\Tariff;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TariffSeeder extends Seeder
{
    public function run()
    {

        $services = Service::all();
        $tariffCount = 0;

        // Определяем единицы измерения для каждого типа услуги
        $unitMap = [
            'capital_repair' => 'm2',
            'current_repair' => 'm2',
            'technical_maintenance' => 'm2',
            'technical_elevator' => 'm2',
            'sanitary_maintenance' => 'fixed',
            'cold_water' => 'm3',
            'water_disposal' => 'm3',
            'hot_water' => 'gcal',
            'heating' => 'gcal',
            'electricity' => 'kwh',
            'gas' => 'm3',
            'waste' => 'm3',
            'meter_installation' => 'fixed',
            'intercom_maintenance' => 'fixed',
            'garbage' => 'fixed',
        ];

        foreach ($services as $service) {
            $rate = match ($service->code) {
                'capital_repair' => 0.2536,
                'current_repair' => 0.0000,
                'technical_maintenance' => 0.1932,
                'technical_elevator' => 0.0902,
                'sanitary_maintenance' => 5.8000,
                'cold_water' => 1.8793,
                'water_disposal' => 1.6267,
                'hot_water' => 24.7183,
                'heating' => 24.7183,
                'electricity' => 0.2969,
                'gas' => 0.2062,
                'waste' => 15.3776,
                'meter_installation' => 76.2,
                'intercom_maintenance' => 1.5,
                default => 100.00,
            };

            // Получаем соответствующую единицу измерения
            $unit = $unitMap[$service->code] ?? 'fixed';

            Tariff::create([
                'service_id' => $service->id,
                'rate' => $rate,
                'unit' => $unit,
                'start_date' =>
                Carbon::create(2025, 1, 1),
            ]);

            $tariffCount++;

            // Для некоторых услуг добавим историю тарифов
            if (in_array($service->code, ['cold_water', 'electricity', 'water_disposal', 'electricity'])) {
                Tariff::create([
                    'service_id' => $service->id,
                    'rate' => $rate * 0.9, // -10%
                    'unit' => $unit,
                    'start_date' => Carbon::create(2024, 1, 1),
                    'end_date' => now()->subMonths(6),
                ]);
                $tariffCount++;
            }
        }

        $this->command->info('✅ Тарифы успешно созданы!');
        $this->command->info("- Всего создано тарифов: {$tariffCount}");
    }
}
