<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class TariffResource extends JsonResource
{
    public function toArray($request)
    {
        $today = Carbon::today();
        $startDate = Carbon::parse($this->start_date);
        $endDate = $this->end_date ? Carbon::parse($this->end_date) : null;

        // Определяем статус тарифа с учетом активности услуги
        $status = 'current';
        $serviceIsActive = $this->service->is_active ?? false;

        if (!$serviceIsActive) {
            $status = 'disabled';
        } elseif ($today->lt($startDate)) {
            $status = 'future';
        } elseif ($endDate && $today->gt($endDate)) {
            $status = 'expired';
        }

        return [
            'id' => $this->id,
            'service_id' => $this->service_id,
            'service_name' => $this->service->name ?? 'Неизвестная услуга',
            'rate' => $this->rate,
            'formatted_rate' => number_format($this->rate, 2) . ' ' . $this->getUnitLabel($this->unit),
            'unit' => $this->unit,
            'start_date' => $this->start_date,
            'formatted_start_date' => $startDate->format('d.m.Y'),
            'end_date' => $this->end_date,
            'formatted_end_date' => $endDate ? $endDate->format('d.m.Y') : 'бессрочно',
            'is_current' => $status === 'current',
            'status' => $status,
            'service_is_active' => $serviceIsActive,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
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
