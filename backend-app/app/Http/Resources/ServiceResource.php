<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\TariffStatusService;
use App\Services\BillingPeriodService;

/**
 * Преобразование услуги в массив для API
 * 
 * @see \App\Http\Controllers\Api\Admin\ServiceController::index() Отображение списка услуг
 * @see \App\Http\Controllers\Api\Admin\ServiceController::show() Отображение конкретной услуги
 * @see \App\Http\Controllers\Api\Admin\ServiceController::store() Отображение услуги при создании
 * @see \App\Http\Controllers\Api\Admin\ServiceController::update() Отображение услуги при редактировании
 * @see \App\Http\Controllers\Api\Admin\ServiceController::toggleActive() Отображение услуги при переключении активности услуги
 * @uses \App\Http\Resources\CurrentTariffResource::toArray() Ресурс для текущего тарифа
 * @uses \App\Http\Resources\TariffResource::toArray() Ресурс для тарифов
 * @uses \App\Http\Resources\MeterTypeResource::toArray() Ресурс для типов счетчиков
 * @uses \App\Services\TariffStatusService::getMultipleTariffsInfo() Получение информации о статусах тарифов
 * @uses self::findCurrentTariff() Определение текущего тарифа
 * @uses self::getCurrentTariffResource() Формирование ресурса текущего тарифа
 * @uses self::getTariffsCollection() Формирование коллекции тарифов
 * 
 * @param mixed $request Объект запроса
 * @return array Структурированные данные услуги
 */

class ServiceResource extends JsonResource
{
    protected $tariffInfos = [];
    protected $currentTariff = null;

    public function toArray($request)
    {
        $billingPeriodService = new BillingPeriodService();
        $tariffStatusService = new TariffStatusService($billingPeriodService);

        // Обрабатываем тарифы если они загружены
        if ($this->resource->relationLoaded('tariffs') && $this->resource->tariffs->isNotEmpty()) {
            // Получаем полную информацию для ВСЕХ тарифов услуги одним запросом
            $this->tariffInfos = $tariffStatusService->getMultipleTariffsInfo(
                $this->resource->tariffs
            );
            // Находим текущий тариф
            $this->findCurrentTariff();
        }

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
            'current_tariff' => $this->getCurrentTariffResource(),
            'tariffs' => $this->getTariffsCollection(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Определение текущего тарифа на основе вычисленных статусов
     * 
     * @uses $this->tariffInfos Предварительно вычисленная информация о тарифах
     * @uses $this->resource->tariffs Загруженная коллекция тарифов
     * 
     * @return $this->currentTariff
     */
    protected function findCurrentTariff(): void
    {
        foreach ($this->resource->tariffs as $tariff) {
            if (
                isset($this->tariffInfos[$tariff->id]) &&
                $this->tariffInfos[$tariff->id]['status'] === 'current'
            ) {
                $this->currentTariff = $tariff;
                break;
            }
        }
    }

    /**
     * Создание ресурса для текущего тарифа с предварительно вычисленным статусом
     * 
     * @uses \App\Http\Resources\CurrentTariffResource Ресурс для текущего тарифа
     * @uses $this->currentTariff Найденный текущий тариф
     * @uses $this->tariffInfos[$this->currentTariff->id] Информация о текущем тарифе
     * 
     * @return CurrentTariffResource|null Ресурс текущего тарифа или null
     */
    protected function getCurrentTariffResource()
    {
        if (!$this->currentTariff || !isset($this->tariffInfos[$this->currentTariff->id])) {
            return null;
        }

        $tariffInfo = $this->tariffInfos[$this->currentTariff->id];

        // Передаем предварительно вычисленные данные в CurrentTariffResource
        return new CurrentTariffResource(
            $this->currentTariff,
            $tariffInfo['status'],
            $tariffInfo['can_edit']
        );
    }

    /**
     * Создание коллекции тарифов с передачей вычисленных статусов
     * 
     * @uses \App\Http\Resources\TariffResource Ресурс для тарифа
     * @uses $this->resource->tariffs Загруженная коллекция тарифов
     * @uses $this->tariffInfos[$tariff->id] Предварительно вычисленная информация о тарифе
     * 
     * @return \Illuminate\Support\Collection|null Коллекция ресурсов тарифов или null
     */
    protected function getTariffsCollection()
    {
        if (!$this->resource->relationLoaded('tariffs')) {
            return null;
        }

        // Используем map для передачи данных каждому TariffResource
        return $this->resource->tariffs->map(function ($tariff) {
            $tariffInfo = $this->tariffInfos[$tariff->id] ?? null;

            return new TariffResource($tariff, $tariffInfo);
        });
    }
}
