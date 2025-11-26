<?php

namespace App\Services;

use Carbon\Carbon;

class BillingPeriodService
{
    /**
     * Получить первый день месяца
     */
    public function firstOfMonth($date = null): Carbon
    {
        $date = $date ? Carbon::parse($date) : Carbon::now();
        return $date->copy()->firstOfMonth();
    }

    /**
     * Получить последний день месяца
     */
    public function lastOfMonth($date = null): Carbon
    {
        $date = $date ? Carbon::parse($date) : Carbon::now();
        return $date->copy()->lastOfMonth();
    }

    /**
     * Проверить, что сегодня до 15 числа включительно
     */
    public function isBeforeOrEqual15th(): bool
    {
        return Carbon::now()->day <= 15;
    }

    /**
     * Получить период для редактирования тарифов
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
     */
    public function validateStartDate($date): bool
    {
        $carbonDate = Carbon::parse($date);
        return $carbonDate->day === 1;
    }

    /**
     * Валидация даты окончания (должна быть последним числом месяца)
     */
    public function validateEndDate($date): bool
    {
        $carbonDate = Carbon::parse($date);
        return $carbonDate->isLastOfMonth();
    }

    /**
     * Получить допустимые даты для start_date (простой массив строк)
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
