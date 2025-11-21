<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\MeterType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceMeterTypeSeeder extends Seeder
{
    public function run()
    {
        // Очищаем таблицу связей
        DB::table('service_meter_types')->truncate();

        // Получаем услуги и типы счетчиков
        $services = Service::all()->keyBy('code');
        $meterTypes = MeterType::all()->keyBy('name');

        // Определяем связи между услугами и типами счетчиков
        $serviceMeterTypeRelations = [
            // Коммунальные услуги по счетчикам
            'water_supply' => ['Холодная вода', 'Горячая вода'], // Водоснснабжение использует оба счетчика
            'water_heating' => ['Подогрев воды'],
            'water_disposal' => ['Холодная вода', 'Горячая вода'], // Водоотведение использует оба счетчика
            'electricity' => ['Электроснабжение'],
            'gas' => ['Газоснабжение'],
            'heating' => ['Отопление'],
            'waste' => [], // Обращение с ТКО - обычно не по счетчику
        ];

        $relationsCount = 0;

        foreach ($serviceMeterTypeRelations as $serviceCode => $meterTypeNames) {
            $service = $services[$serviceCode] ?? null;

            if (!$service) {
                $this->command->warn("Услуга с кодом {$serviceCode} не найдена");
                continue;
            }

            // Проверяем, что услуга действительно по счетчику
            if ($service->calculation_type !== 'meter') {
                $this->command->warn("Услуга {$serviceCode} не является услугой по счетчику, пропускаем");
                continue;
            }

            foreach ($meterTypeNames as $meterTypeName) {
                $meterType = $meterTypes[$meterTypeName] ?? null;

                if (!$meterType) {
                    $this->command->warn("Тип счетчика {$meterTypeName} не найден");
                    continue;
                }

                // Создаем связь
                DB::table('service_meter_types')->insert([
                    'service_id' => $service->id,
                    'meter_type_id' => $meterType->id,
                    'order' => $relationsCount,
                    'is_required' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $relationsCount++;
                $this->command->info("Связали услугу '{$service->name}' с типом счетчика '{$meterType->name}'");
            }
        }

        $this->command->info('✅ Связи между услугами и типами счетчиков успешно созданы!');
        $this->command->info("- Всего создано связей: {$relationsCount}");
    }
}
