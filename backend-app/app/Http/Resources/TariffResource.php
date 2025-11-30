<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;
use App\Services\TariffStatusService;
use App\Services\BillingPeriodService;
use App\Helpers\FormatHelper;

class TariffResource extends JsonResource
{
    public function toArray($request)
    {
        $startDate = Carbon::parse($this->start_date);
        $endDate = $this->end_date ? Carbon::parse($this->end_date) : null;

        // Определяем базовые параметры
        $isServiceDeleted = is_null($this->service_id);

        // Для архивных тарифов используем сохраненные данные
        if ($isServiceDeleted) {
            $serviceName = $this->service_name ?? 'Удаленная услуга';
            $serviceIsActive = false;
            $status = 'expired';
        } else {
            $serviceName = $this->service->name ?? 'Неизвестная услуга';
            $serviceIsActive = $this->service->is_active ?? false;
            $status = $this->getTariffStatus();
        }

        $formattedRate = FormatHelper::formatTariff($this->rate, $this->unit);

        return [
            'id' => $this->id,
            'service_id' => $this->service_id,
            'service_name' => $serviceName,
            'rate' => $this->rate,
            'formatted_rate' => $formattedRate,
            'unit' => $this->unit,
            'start_date' => $this->start_date,
            'formatted_start_date' => $startDate->format('d.m.Y'),
            'end_date' => $this->end_date,
            'formatted_end_date' => $endDate ? $endDate->format('d.m.Y') : 'бессрочно',
            'is_current' => $status === 'current',
            'status' => $status,
            'service_is_active' => $serviceIsActive,
            'is_service_deleted' => $isServiceDeleted,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Определяет статус тарифа с использованием бизнес-логики
     */
    protected function getTariffStatus(): string
    {
        // Если услуга не активна - тариф отключен
        if (!$this->service->is_active) {
            return 'disabled';
        }

        // Используем бизнес-логику для активных услуг
        $billingPeriodService = new BillingPeriodService();
        $tariffStatusService = new TariffStatusService($billingPeriodService);

        return $tariffStatusService->getStatus($this->resource);
    }

}
