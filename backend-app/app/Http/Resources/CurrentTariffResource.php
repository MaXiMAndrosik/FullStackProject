<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\TariffStatusService;
use App\Services\BillingPeriodService;
use App\Helpers\FormatHelper;


class CurrentTariffResource extends JsonResource
{
    protected $precomputedStatus;

    /**
     * Конструктор с поддержкой предварительно вычисленного статуса
     */
    public function __construct($resource, $precomputedStatus = null)
    {
        parent::__construct($resource);
        $this->precomputedStatus = $precomputedStatus;
    }

    public function toArray($request)
    {
        $status = 'current';
        $formattedRate = FormatHelper::formatTariff($this->rate, $this->unit);

        return [
            'id' => $this->id,
            // 'rate' => $this->rate,
            'formatted_rate' => $formattedRate,
            // 'unit' => $this->unit,
            'start_date' => $this->start_date,
            // 'end_date' => $this->end_date,
            // 'status' => $status,
            // 'can_edit' => $this->canEdit,
            // 'is_current' => $status === 'current',
        ];
    }
}
