<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\TariffStatusService;
use App\Services\BillingPeriodService;
use Carbon\Carbon;
use App\Helpers\FormatHelper;
use Illuminate\Support\Facades\Log;

/**
 * Преобразование тарифа в массив для API
 * 
 * @see \App\Http\Controllers\Api\Admin\ServiceController::index() Отображение услуг с тарифами
 * @see \App\Http\Controllers\Api\Admin\TariffController::show() Отображение конкретного тарифа
 * @uses \App\Services\TariffStatusService::getTariffInfo() Получение информации о тарифе
 * @uses \App\Helpers\FormatHelper::formatTariff() Форматирование значения тарифа
 * @uses Carbon::parse() Парсинг дат
 * @uses self::getServiceName() Получение названия услуги
 * @uses self::getServiceIsActive() Проверка активности услуги
 * @uses self::computeInfoFallback() Резервное вычисление информации
 * 
 * @param mixed $request Объект запроса
 * @return array Структурированные данные тарифа
 */

class TariffResource extends JsonResource
{
    protected $tariffInfo;

    public function __construct($resource, $tariffInfo = null)
    {
        parent::__construct($resource);
        $this->tariffInfo = $tariffInfo;
    }

    public function toArray($request)
    {
        $startDate = Carbon::parse($this->start_date);
        $endDate = $this->end_date ? Carbon::parse($this->end_date) : null;

        // Определяем базовые параметры
        $isServiceDeleted = is_null($this->service_id);
        $serviceIsActive = $this->getServiceIsActive($isServiceDeleted);

        // Получаем статус и can_edit из предварительно вычисленных данных
        $status = 'unknown';
        $canEdit = false;

        // Для удаленных услуг - статус expired, редактирование невозможно
        if ($isServiceDeleted) {
            $status = 'expired';
            $canEdit = false;
        }
        // Если есть предварительно вычисленная информация - используем её
        elseif ($this->tariffInfo) {
            $status = $this->tariffInfo['status'];
            $canEdit = $this->tariffInfo['can_edit'];

            // Если услуга не активна, переопределяем статус на disabled,
            // но сохраняем вычисленный can_edit
            if (!$serviceIsActive && $status !== 'expired') {
                $status = 'disabled';
            }
        }
        // Fallback: вычисляем самостоятельно
        else {
            Log::warning('TariffResource: информация не найдена в контексте', [
                'tariff_id' => $this->id
            ]);

            list($status, $canEdit) = $this->computeInfoFallback();

            // Если услуга не активна, переопределяем статус на disabled,
            // но сохраняем вычисленный can_edit
            if (!$serviceIsActive && $status !== 'expired') {
                $status = 'disabled';
            }
        }

        $formattedRate = FormatHelper::formatTariff($this->rate, $this->unit);

        return [
            'id' => $this->id,
            'service_id' => $this->service_id,
            'service_name' => $this->getServiceName($isServiceDeleted),
            'rate' => $this->rate,
            'formatted_rate' => $formattedRate,
            'unit' => $this->unit,
            'start_date' => $this->start_date,
            'formatted_start_date' => $startDate->format('d.m.Y'),
            'end_date' => $this->end_date,
            'formatted_end_date' => $endDate ? $endDate->format('d.m.Y') : 'бессрочно',
            'is_current' => $status === 'current',
            'status' => $status,
            'can_edit' => $canEdit,
            'service_is_active' => $serviceIsActive,
            'is_service_deleted' => $isServiceDeleted,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Получение названия услуги
     * 
     * @uses $this->service_name Название услуги из связи
     * @uses $this->service->name Название через отношение
     * 
     * @param bool $isServiceDeleted Флаг удаления услуги
     * @return string Название услуги
     */
    protected function getServiceName(bool $isServiceDeleted): string
    {
        if ($isServiceDeleted) {
            return $this->service_name ?? 'Удаленная услуга';
        }

        return $this->service->name ?? 'Неизвестная услуга';
    }

    /**
     * Получение активности услуги
     * 
     * @uses $this->service->is_active Статус активности через отношение
     * 
     * @param bool $isServiceDeleted Флаг удаления услуги
     * @return bool Активность услуги
     */
    protected function getServiceIsActive(bool $isServiceDeleted): bool
    {
        if ($isServiceDeleted) {
            return false;
        }

        return $this->service->is_active ?? false;
    }

    /**
     * Резервное вычисление информации о тарифе
     * 
     * @uses \App\Services\TariffStatusService::getTariffInfo() Получение информации о тарифе
     * 
     * @return array Статус и возможность редактирования
     */
    protected function computeInfoFallback(): array
    {
        $billingPeriodService = new BillingPeriodService();
        $tariffStatusService = new TariffStatusService($billingPeriodService);

        $info = $tariffStatusService->getTariffInfo($this->resource);

        return [
            $info['status'] ?? 'unknown',
            $info['can_edit'] ?? false,
        ];
    }
}
