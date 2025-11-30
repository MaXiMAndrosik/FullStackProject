<?php

namespace App\Helpers;

class FormatHelper
{
    /**
     * Форматирование числа с удалением незначащих нулей (аналог фронтенда)
     */
    public static function formatRate($value): string
    {
        if (!is_numeric($value)) {
            return '0.00';
        }

        // Округляем до 4 знаков и удаляем незначащие нули
        $formatted = number_format((float)$value, 2, '.', '');
        $formatted = rtrim($formatted, '0');
        $formatted = rtrim($formatted, '.');

        // Если число целое - добавляем .0 для указания на десятичную дробь
        if (strpos($formatted, '.') === false) {
            $formatted .= '.00';
        }

        return $formatted;
    }

    /**
     * Получить label для единицы измерения
     */
    public static function getUnitLabel($unit): string
    {
        $units = [
            'm2' => 'руб/м²',
            'm3' => 'руб/м³',
            'gcal' => 'руб/Гкал',
            'kwh' => 'руб/кВт·ч',
            'fixed' => 'руб',
        ];

        return $units[$unit] ?? $unit;
    }

    /**
     * Форматирование тарифа с единицей измерения
     */
    public static function formatTariff($rate, $unit): string
    {
        $formattedRate = self::formatRate($rate);
        $unitLabel = self::getUnitLabel($unit);

        return "{$formattedRate} {$unitLabel}";
    }
}
