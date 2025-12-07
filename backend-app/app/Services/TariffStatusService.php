<?php

namespace App\Services;

use App\Models\Tariff;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use App\Traits\CollectsMetrics;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Сервис для определения статуса тарифов
 * 
 * @see \App\Services\ServiceBusinessService Основной потребитель сервиса
 * @see \App\Http\Controllers\Api\Admin\ServiceController Используется через ServiceBusinessService
 * @uses \App\Models\Tariff Модель тарифа
 * @uses \App\Services\BillingPeriodService Сервис биллинговых периодов
 * @uses Carbon Для работы с датами
 * @uses \App\Traits\CollectsMetrics Для сбора метрик производительности
 */
class TariffStatusService
{
    use CollectsMetrics;

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
     * Получение полной информации о тарифе (статус + возможность редактирования)
     * 
     * @see \App\Http\Resources\TariffResource::computeInfoFallback() Используется для получения информации о тарифе
     * @uses \App\Services\BillingPeriodService::getCurrentPeriod() Получение текущего периода
     * @uses self::generateDatesHash() Получение хеша на основе дат для тарифа
     * @uses self::calculateStatus() Вычисление статуса тарифа
     * @uses self::calculateCanEdit() Проверка возможности редактирования тарифа
     * 
     * @param Tariff $tariff Тариф для анализа
     * @return array Информация о статусе и возможности редактирования
     */
    public function getTariffInfo(Tariff $tariff): array
    {
        return $this->withMetrics(__FUNCTION__, function () use ($tariff) {
            // Кешируем всю информацию о тарифе
            $datesHash = $this->generateDatesHash($tariff);
            $today = Carbon::now()->format('Y-m-d');
            $cacheKey = "tariff:info:{$tariff->id}:{$datesHash}:{$today}";

            $ttl = Carbon::now()->diffInSeconds(Carbon::now()->endOfDay());

            return Cache::remember($cacheKey, $ttl, function () use ($tariff) {
                Log::info('TariffStatusService::getTariffInfo() calculating...');
                // Получаем период один раз
                $period = $this->billingPeriodService->getCurrentPeriod();
                // Вычисляем статус
                $status = $this->calculateStatus($tariff, $period);
                // Вычисляем возможность редактирования
                $canEdit = $this->calculateCanEdit($tariff, $period, $status);

                return [
                    'status' => $status,
                    'can_edit' => $canEdit,
                ];
            });
        });
    }

    /**
     * Получение информации о нескольких тарифах за один запрос
     * 
     * @see \App\Http\Resources\ServiceResource::toArray() Используется для получения информации о тарифах
     * @uses \App\Services\BillingPeriodService::getCurrentPeriod() Получение текущего периода
     * @uses self::generateDatesHash() Получение хеша на основе дат для тарифа
     * @uses self::calculateStatus() Вычисление статуса тарифа
     * @uses self::calculateCanEdit() Проверка возможности редактирования тарифа
     * 
     * @param array|Collection $tariffs Коллекция тарифов
     * @return array Информация о всех тарифах
     */
    public function getMultipleTariffsInfo($tariffs): array
    {
        return $this->withMetrics(__FUNCTION__, function () use ($tariffs) {
            $today = Carbon::now()->format('Y-m-d');
            $period = $this->billingPeriodService->getCurrentPeriod();

            $result = [];

            foreach ($tariffs as $tariff) {
                $datesHash = $this->generateDatesHash($tariff);
                $cacheKey = "tariff:info:{$tariff->id}:{$datesHash}:{$today}";
                $ttl = Carbon::now()->diffInSeconds(Carbon::now()->endOfDay());

                $info = Cache::remember($cacheKey, $ttl, function () use ($tariff, $period) {
                    Log::info('TariffStatusService::getMultipleTariffsInfo() calculating...');

                    $status = $this->calculateStatus($tariff, $period);
                    $canEdit = $this->calculateCanEdit($tariff, $period, $status);

                    return [
                        'status' => $status,
                        'can_edit' => $canEdit,
                    ];
                });

                $result[$tariff->id] = array_merge($info, [
                    'tariff_id' => $tariff->id,
                    'start_date' => $tariff->start_date,
                    'end_date' => $tariff->end_date,
                ]);
            }

            return $result;
        });
    }

    /**
     * Вычисление статуса тарифа
     * 
     * @uses Carbon::parse() Парсинг дат начала и окончания
     * @uses $period['active_start'] Начало активного периода
     * @uses $period['active_end'] Окончание активного периода
     * @uses $period['future_start'] Начало будущего периода
     * 
     * @param Tariff $tariff Тариф для анализа
     * @param array $period Данные текущего периода
     * @return string Статус тарифа
     */
    private function calculateStatus(Tariff $tariff, array $period): string
    {
        $startDate = Carbon::parse($tariff->start_date);
        $endDate = $tariff->end_date ? Carbon::parse($tariff->end_date) : null;

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

        return 'none';
    }

    /**
     * Вычисление возможности редактирования
     * 
     * @uses Carbon::parse() Парсинг даты начала
     * @uses $period['active_start'] Начало активного периода
     * 
     * @param Tariff $tariff Тариф для анализа
     * @param array $period Данные текущего периода
     * @param string $status Статус тарифа
     * @return bool Возможность редактирования
     */
    private function calculateCanEdit(Tariff $tariff, array $period, string $status): bool
    {
        if ($status === 'current') {
            $startDate = Carbon::parse($tariff->start_date);
            return $startDate->equalTo($period['active_start']);
        }

        return $status === 'future';
    }

    /**
     * Определение статуса тарифа
     * 
     * @see \App\Services\ServiceBusinessService::deleteService() Используется при удалении услуги
     * @see \App\Services\ServiceBusinessService::handleFutureTariffs() Используется при обработке будущих тарифов
     * @see \App\Services\ServiceBusinessService::handleCurrentTariffs() Используется при обработке текущих тарифов
     * @uses self::getTariffInfo() Получение полной информации о тарифе
     * 
     * @param Tariff $tariff Тариф для определения статуса
     * @return string Статус тарифа: 'current', 'future', 'expired', 'none'
     */
    public function getStatus(Tariff $tariff): string
    {
        return $this->withMetrics(
            __FUNCTION__,
            function () use ($tariff) {
                Log::info('TariffStatusService::getStatus() calculating...');
                $info = $this->getTariffInfo($tariff);
                return $info['status'];
            }
        );
    }

    /**
     * Проверка возможности редактирования тарифа
     * 
     * @uses self::getTariffInfo() Получение полной информации о тарифе
     * 
     * @param Tariff $tariff Тариф для определения возможности редактирования тарифа
     * @return bool Можно ли редактировать тариф
     */
    public function canEditTariff(Tariff $tariff): bool
    {
        return $this->withMetrics(
            __FUNCTION__,
            function () use ($tariff) {
                Log::info('TariffStatusService::canEditTariff() calculating...');
                $info = $this->getTariffInfo($tariff);
                return $info['can_edit'];
            }
        );
    }

    /**
     * Генерация хеша дат тарифа
     * 
     * @param Tariff $tariff Тариф для хеширования
     * @return string Хеш дат тарифа
     */
    private function generateDatesHash(Tariff $tariff): string
    {
        // Хешируем даты, чтобы кеш автоматически инвалидировался при их изменении
        return md5($tariff->start_date . '|' . ($tariff->end_date ?? 'null'));
    }
}
