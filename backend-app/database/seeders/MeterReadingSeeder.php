<?php

namespace Database\Seeders;

use App\Models\Meter;
use App\Models\MeterReading;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class MeterReadingSeeder extends Seeder
{
    public function run()
    {
        $meters = Meter::where('is_active', true)->get();

        if ($meters->isEmpty()) {
            $this->command->info('❌ Нет активных счетчиков для заполнения показаний');
            return;
        }

        $readingCount = 0;
        $now = Carbon::now();

        foreach ($meters as $meter) {
            // Начальное значение для счетчика
            $currentValue = rand(1000, 5000);

            // Создаем показания за последние 5 месяцев без текущего и предыдущего
            for ($i = 7; $i >= 2; $i--) {
                $period = $now->copy()->subMonths($i)->startOfMonth()->setDay(25);

                // Увеличиваем значение каждый месяц
                $monthlyUsage = rand(50, 200);
                $currentValue += $monthlyUsage;

                MeterReading::create([
                    'meter_id' => $meter->id,
                    'period' => $period,
                    'value' => $currentValue,
                    'is_fixed' => true
                ]);

                $readingCount++;
            }
        }

        $this->command->info("✅ Показания счетчиков успешно созданы!");
        $this->command->info("- Всего создано записей показаний: {$readingCount}");
        $this->command->info("- Период: предпоследние 5 месяцев");
    }
}
