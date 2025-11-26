<?php

namespace App\Services;

use App\Models\Tariff;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class TariffStatusService
{
    protected $billingPeriodService;

    public function __construct(BillingPeriodService $billingPeriodService)
    {
        $this->billingPeriodService = $billingPeriodService;
    }

    /**
     * Определить статус тарифа
     */
    public function getStatus(Tariff $tariff): string
    {
        $period = $this->billingPeriodService->getEditingPeriod();
        $startDate = Carbon::parse($tariff->start_date);
        $endDate = $tariff->end_date ? Carbon::parse($tariff->end_date) : null;

        if ($period['is_before_15th']) {
            // До 15 числа
            if (
                $startDate->lte($period['active_start']) &&
                (!$endDate || $endDate->gte($period['active_end']))
            ) {
                return 'current';
            } elseif (
                $startDate->gte($period['future_start']) &&
                (!$endDate || $endDate->gt($period['active_end']))
            ) {
                return 'future';
            } elseif ($endDate && $endDate->lt($period['active_start'])) {
                return 'expired';
            }
        } else {
            // После 15 числа
            if (
                $startDate->lte($period['active_start']) &&
                (!$endDate || $endDate->gte($period['active_end']))
            ) {
                return 'current';
            } elseif (
                $startDate->gte($period['future_start']) &&
                (!$endDate || $endDate->gt($period['active_end']))
            ) {
                return 'future';
            } elseif ($endDate && $endDate->lt($period['active_start'])) {
                return 'expired';
            }
        }

        return 'none';
    }

    /**
     * Получить все тарифы услуги с определенным статусом
     */
    public function getTariffsByStatus($serviceId, string $status): Collection
    {
        $tariffs = Tariff::where('service_id', $serviceId)->get();

        return $tariffs->filter(function ($tariff) use ($status) {
            return $this->getStatus($tariff) === $status;
        });
    }

    /**
     * Получить первый тариф с определенным статусом
     */
    public function getFirstTariffByStatus($serviceId, string $status): ?Tariff
    {
        $tariffs = Tariff::where('service_id', $serviceId)->get();

        foreach ($tariffs as $tariff) {
            if ($this->getStatus($tariff) === $status) {
                return $tariff;
            }
        }

        return null;
    }

    /**
     * Можно ли редактировать тариф
     */
    public function canEditTariff(Tariff $tariff): bool
    {
        $status = $this->getStatus($tariff);
        $period = $this->billingPeriodService->getEditingPeriod();

        if ($status === 'current') {
            $startDate = Carbon::parse($tariff->start_date);

            if ($period['is_before_15th']) {
                return $startDate->equalTo($period['active_start']);
            } else {
                return $startDate->equalTo($period['active_start']);
            }
        }

        return $status === 'future';
    }
}
