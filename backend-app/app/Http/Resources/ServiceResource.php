<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\TariffStatusService;
use App\Services\BillingPeriodService;

class ServiceResource extends JsonResource
{
    public function toArray($request)
    {
        $billingPeriodService = new BillingPeriodService();
        $tariffStatusService = new TariffStatusService($billingPeriodService);

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
            'current_tariff' => $this->getCurrentTariff($tariffStatusService),
            'tariffs' => TariffResource::collection($this->whenLoaded('tariffs')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    protected function getCurrentTariff(TariffStatusService $tariffStatusService)
    {
        if (!$this->resource->relationLoaded('tariffs')) {
            return null;
        }

        foreach ($this->resource->tariffs as $tariff) {
            $status = $tariffStatusService->getStatus($tariff);
            if ($status === 'current') {
                return new CurrentTariffResource($tariff);
            }
        }

        return null;
    }
}
