<?php

namespace App\Services;

use Carbon\Carbon;

/**
 * Сервис для работы с биллинговыми периодами
 * 
 * @see \App\Services\ServiceBusinessService Основной потребитель сервиса
 * @see \App\Services\TariffStatusService Используется для определения статусов
 * @see \App\Http\Controllers\Api\Admin\ServiceController Используется через ServiceBusinessService
 * @uses Carbon Для работы с датами
 */
class BillingPeriodService
{
    /**
     * Получить первый день месяца
     * 
     * @see \App\Services\ServiceBusinessService::validateTariffStartDate() Используется при валидации
     * @see self::getEditingPeriod() Используется для формирования периода
     * @uses Carbon::parse() Парсинг входной даты
     * @uses Carbon::firstOfMonth() Получение первого дня месяца
     * 
     * @param mixed $date Дата для обработки (null для текущей даты)
     * @return Carbon Первый день месяца
     */
    public function firstOfMonth($date = null): Carbon
    {
        $date = $date ? Carbon::parse($date) : Carbon::now();
        return $date->copy()->firstOfMonth();
    }

    /**
     * Получить последний день месяца
     * 
     * @see \App\Services\ServiceBusinessService::deleteService() Используется при удалении услуги
     * @see self::getEditingPeriod() Используется для формирования периода
     * @uses Carbon::parse() Парсинг входной даты
     * @uses Carbon::lastOfMonth() Получение последнего дня месяца
     * 
     * @param mixed $date Дата для обработки (null для текущей даты)
     * @return Carbon Последний день месяца
     */
    public function lastOfMonth($date = null): Carbon
    {
        $date = $date ? Carbon::parse($date) : Carbon::now();
        return $date->copy()->lastOfMonth();
    }

    /**
     * Проверить, что сегодня до 15 числа включительно
     * 
     * @see self::getEditingPeriod() Определяет логику формирования периода
     * @see self::getAllowedStartDates() Определяет доступные даты
     * @uses Carbon::now() Получение текущей даты
     * 
     * @return bool True если сегодня до 15 числа включительно
     */
    public function isBeforeOrEqual15th(): bool
    {
        return Carbon::now()->day <= 15;
    }

    /**
     * Получить период для редактирования тарифов
     * 
     * @see \App\Services\ServiceBusinessService::deleteService() Используется при удалении услуги
     * @see \App\Services\ServiceBusinessService::handleCalculationTypeChange() Используется при изменении типа расчета
     * @see \App\Services\ServiceBusinessService::handleMeterTypeIdsChange() Используется при изменении типов счетчиков
     * @see \App\Services\TariffStatusService::getStatus() Используется для определения статуса тарифов
     * @uses self::firstOfMonth() Получение первых дней месяцев
     * @uses self::lastOfMonth() Получение последних дней месяцев
     * @uses self::isBeforeOrEqual15th() Проверка текущей даты
     * 
     * @return array Массив с данными периода редактирования
     */
    public function getEditingPeriod(): array
    {
        $today = Carbon::now();
        $isBefore15th = $this->isBeforeOrEqual15th();

        if ($isBefore15th) {
            // До 15 числа - работаем с предыдущим месяцем
            $activeStart = $this->firstOfMonth($today->copy()->subMonth());
            $activeEnd = $this->lastOfMonth($today->copy()->subMonth());
            $futureStart = $this->firstOfMonth($today);
        } else {
            // После 15 числа - работаем с текущим месяцем
            $activeStart = $this->firstOfMonth($today);
            $activeEnd = $this->lastOfMonth($today);
            $futureStart = $this->firstOfMonth($today->copy()->addMonth());
        }

        return [
            'is_before_15th' => $isBefore15th,
            'active_start' => $activeStart,
            'active_end' => $activeEnd,
            'future_start' => $futureStart,
            'previous_month_end' => $this->lastOfMonth($today->copy()->subMonth()),
            'two_months_ago_end' => $this->lastOfMonth($today->copy()->subMonths(2)),
        ];
    }

    /**
     * Валидация даты начала (должна быть первым числом месяца)
     * 
     * @see \App\Services\ServiceBusinessService::validateTariffStartDate() Основное использование
     * @uses Carbon::parse() Парсинг даты
     * 
     * @param mixed $date Проверяемая дата
     * @return bool True если дата является первым числом месяца
     */
    public function validateStartDate($date): bool
    {
        $carbonDate = Carbon::parse($date);
        return $carbonDate->day === 1;
    }

    /**
     * Валидация даты окончания (должна быть последним числом месяца)
     * 
     * @uses Carbon::parse() Парсинг даты
     * @uses Carbon::isLastOfMonth() Проверка последнего дня месяца
     * 
     * @param mixed $date Проверяемая дата
     * @return bool True если дата является последним числом месяца
     */
    public function validateEndDate($date): bool
    {
        $carbonDate = Carbon::parse($date);
        return $carbonDate->isLastOfMonth();
    }

    /**
     * Получить допустимые даты для start_date (простой массив строк)
     * 
     * @see \App\Services\ServiceBusinessService::validateTariffStartDate() Используется для валидации
     * @uses self::getEditingPeriod() Получение текущего периода
     * @uses Carbon::now() Получение текущей даты
     * @uses Carbon::addMonths() Добавление месяцев
     * @uses Carbon::firstOfMonth() Получение первого дня месяца
     * 
     * @return array Массив допустимых дат в формате Y-m-d
     */
    public function getAllowedStartDates(): array
    {
        $period = $this->getEditingPeriod();
        $allowedDates = [];

        if ($period['is_before_15th']) {
            // До 15 числа: можно установить даты в прошлом, текущем и будущих месяцах
            for ($i = -1; $i <= 12; $i++) {
                $date = Carbon::now()->addMonths($i)->firstOfMonth();
                $allowedDates[] = $date->format('Y-m-d');
            }
        } else {
            // После 15 числа: можно установить даты в текущем и будущих месяцах
            for ($i = 0; $i <= 12; $i++) {
                $date = Carbon::now()->addMonths($i)->firstOfMonth();
                $allowedDates[] = $date->format('Y-m-d');
            }
        }

        return $allowedDates;
    }

    /**
     * Получить допустимые даты для start_date с понятными названиями
     * 
     * @uses self::getEditingPeriod() Получение текущего периода
     * @uses self::getMonthLabel() Формирование понятных названий
     * 
     * @return array Массив с данными дат и их labels
     */
    public function getAllowedStartDatesWithLabels(): array
    {
        $period = $this->getEditingPeriod();
        $allowedDates = [];

        if ($period['is_before_15th']) {
            // До 15 числа: можно установить даты в прошлом, текущем и будущих месяцах
            for ($i = -12; $i <= 12; $i++) {
                $date = Carbon::now()->addMonths($i)->firstOfMonth();
                $label = $this->getMonthLabel($date, $i);
                $allowedDates[] = [
                    'value' => $date->format('Y-m-d'),
                    'label' => $label
                ];
            }
        } else {
            // После 15 числа: можно установить даты в текущем и будущих месяцах
            for ($i = 0; $i <= 12; $i++) {
                $date = Carbon::now()->addMonths($i)->firstOfMonth();
                $label = $this->getMonthLabel($date, $i);
                $allowedDates[] = [
                    'value' => $date->format('Y-m-d'),
                    'label' => $label
                ];
            }
        }

        return $allowedDates;
    }

    /**
     * Получить понятное название для месяца
     * 
     * @uses Carbon Получение месяца и года
     * 
     * @param Carbon $date Дата
     * @param int $offset Смещение в месяцах
     * @return string Понятное название месяца
     */
    private function getMonthLabel(Carbon $date, int $offset): string
    {
        $monthNames = [
            1 => 'январь',
            2 => 'февраль',
            3 => 'март',
            4 => 'апрель',
            5 => 'май',
            6 => 'июнь',
            7 => 'июль',
            8 => 'август',
            9 => 'сентябрь',
            10 => 'октябрь',
            11 => 'ноябрь',
            12 => 'декабрь'
        ];

        $month = $monthNames[$date->month];
        $year = $date->year;

        if ($offset === -1) return "{$month} {$year} (прошлый месяц)";
        if ($offset === 0) return "{$month} {$year} (текущий месяц)";
        if ($offset === 1) return "{$month} {$year} (следующий месяц)";

        if ($offset < -1) return "{$month} {$year} (прошлое)";
        return "{$month} {$year} (будущее)";
    }

    /**
     * Получить примеры допустимых дат для отображения в ошибках
     * 
     * @see \App\Services\ServiceBusinessService::validateTariffStartDate() Используется в сообщениях об ошибках
     * @uses self::getEditingPeriod() Получение текущего периода
     * @uses Carbon::now() Получение текущей даты
     * 
     * @return array Массив примеров дат в формате d.m.Y
     */
    public function getDateExamples(): array
    {
        $period = $this->getEditingPeriod();
        $examples = [];

        if ($period['is_before_15th']) {
            // Примеры для периода до 15 числа
            $examples[] = Carbon::now()->subMonth()->firstOfMonth()->format('d.m.Y'); // прошлый месяц
            $examples[] = Carbon::now()->firstOfMonth()->format('d.m.Y'); // текущий месяц
            $examples[] = Carbon::now()->addMonth()->firstOfMonth()->format('d.m.Y'); // следующий месяц
        } else {
            // Примеры для периода после 15 числа
            $examples[] = Carbon::now()->firstOfMonth()->format('d.m.Y'); // текущий месяц
            $examples[] = Carbon::now()->addMonth()->firstOfMonth()->format('d.m.Y'); // следующий месяц
            $examples[] = Carbon::now()->addMonths(2)->firstOfMonth()->format('d.m.Y'); // через месяц
        }

        return $examples;
    }
}
