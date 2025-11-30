<?php

namespace App\Services;

use App\Models\Tariff;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Сервис для определения статуса тарифов
 * 
 * @see \App\Services\ServiceBusinessService Основной потребитель сервиса
 * @see \App\Http\Controllers\Api\Admin\ServiceController Используется через ServiceBusinessService
 * @uses \App\Models\Tariff Модель тарифа
 * @uses \App\Services\BillingPeriodService Сервис биллинговых периодов
 * @uses Carbon Для работы с датами
 */
class TariffStatusService
{
    protected $billingPeriodService;

    /**
     * Конструктор сервиса
     * 
     * @param BillingPeriodService $billingPeriodService Сервис биллинговых периодов
     */
    public function __construct(BillingPeriodService $billingPeriodService)
    {
        $this->billingPeriodService = $billingPeriodService;
    }

    /**
     * Определить статус тарифа
     * 
     * @see \App\Services\ServiceBusinessService::deleteService() Используется при удалении услуги
     * @see \App\Services\ServiceBusinessService::handleFutureTariffs() Используется при обработке будущих тарифов
     * @see \App\Services\ServiceBusinessService::handleCurrentTariffs() Используется при обработке текущих тарифов
     * @uses \App\Services\BillingPeriodService::getEditingPeriod() Получение текущего периода редактирования
     * @uses Carbon::parse() Парсинг дат
     * 
     * @param Tariff $tariff Тариф для определения статуса
     * @return string Статус тарифа: 'current', 'future', 'expired', 'none'
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
     * 
     * @uses \App\Models\Tariff::where() Запрос тарифов услуги
     * @uses self::getStatus() Определение статуса каждого тарифа
     * 
     * @param mixed $serviceId ID услуги
     * @param string $status Требуемый статус
     * @return Collection Коллекция тарифов с указанным статусом
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
     * 
     * @uses self::getStatus() Определение статуса тарифа
     * 
     * @param mixed $serviceId ID услуги
     * @param string $status Требуемый статус
     * @return Tariff|null Первый тариф с указанным статусом или null
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
     * Проверить возможность редактирования тарифа
     * 
     * @uses self::getStatus() Определение статуса тарифа
     * @uses \App\Services\BillingPeriodService::getEditingPeriod() Получение периода редактирования
     * @uses Carbon::parse() Парсинг даты начала
     * 
     * @param Tariff $tariff Проверяемый тариф
     * @return bool Можно ли редактировать тариф
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
