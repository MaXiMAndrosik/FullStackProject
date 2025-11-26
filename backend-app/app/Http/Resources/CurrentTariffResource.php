<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\TariffStatusService;
use App\Services\BillingPeriodService;
use App\Helpers\FormatHelper;


class CurrentTariffResource extends JsonResource
{
    public function toArray($request)
    {
        $billingPeriodService = new BillingPeriodService();
        $tariffStatusService = new TariffStatusService($billingPeriodService);

        $status = $tariffStatusService->getStatus($this->resource);
        $formattedRate = FormatHelper::formatTariff($this->rate, $this->unit);

        return [
            'id' => $this->id,
            'rate' => $this->rate,
            'formatted_rate' => $formattedRate,
            'unit' => $this->unit,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'status' => $status,
            'is_current' => $status === 'current',
        ];
    }

}
