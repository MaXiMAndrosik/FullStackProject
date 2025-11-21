<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ServiceResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'code' => $this->code,
            'description' => $this->description,
            'calculation_type' => $this->calculation_type,
            'is_active' => $this->is_active,
            'meter_types' => $this->when(
                $this->calculation_type === 'meter',
                MeterTypeResource::collection($this->whenLoaded('meterTypes'))
            ),
            'current_tariff' => $this->getCurrentTariff(),
            'tariffs' => TariffResource::collection($this->whenLoaded('tariffs')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function getCurrentTariff()
    {
        try {
            if (!$this->relationLoaded('tariffs') || $this->tariffs->isEmpty()) {
                return null;
            }

            $currentTariff = $this->tariffs->first(function ($tariff) {
                return $tariff->end_date === null ||
                    Carbon::parse($tariff->end_date)->isFuture();
            });

            if (!$currentTariff) {
                $currentTariff = $this->tariffs->sortByDesc('start_date')->first();
            }

            if (!$currentTariff) {
                return null;
            }

            // Вместо строки возвращаем объект с нужными полями
            return [
                'start_date' => $currentTariff->start_date,
                'rate' => (float) $currentTariff->rate,
                'unit' => $currentTariff->unit,
                'formatted_rate' => number_format($currentTariff->rate, 2) . ' ' . $this->getUnitLabel($currentTariff->unit)
            ];
        } catch (\Exception $e) {
            Log::error('Error in getCurrentTariff: ' . $e->getMessage());
            return null;
        }
    }

    private function getUnitLabel($unit)
    {
        $units = [
            'm2' => 'руб/м²',
            'm3' => 'руб/м³',
            'gcal' => 'руб/Гкал',
            'kwh' => 'руб/кВт·ч',
            'fixed' => 'руб',
        ];

        return $units[$unit] ?? $unit;
    }
}
