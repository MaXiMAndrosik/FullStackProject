<?php

namespace Database\Seeders;

use App\Models\Apartment;
use App\Models\Meter;
use App\Models\MeterType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class MeterSeeder extends Seeder
{
    public function run()
    {
        $apartments = Apartment::all();
        $types = MeterType::all();

        if ($apartments->isEmpty() || $types->isEmpty()) {
            return;
        }

        $meterCount = 0;

        foreach ($apartments as $apartment) {
            foreach ($types as $type) {
                $installationDate = Carbon::now()->subYears(rand(0, 5))->subDays(rand(0, 365));

                Meter::create([
                    'apartment_id' => $apartment->id,
                    'type_id' => $type->id,
                    'serial_number' => 'SN-' . $apartment->id . '-' . $type->id . '-' . rand(1000, 9999),
                    'installation_date' => $installationDate,
                    'next_verification_date' => $installationDate->copy()->addYears(rand(4, 8)),
                    'is_active' => true
                ]);

                $meterCount++;
            }
        }

        $this->command->info('✅ Счетчики успешно созданы!');
        $this->command->info("- Всего создано счетчиков: {$meterCount}");
    }
}
