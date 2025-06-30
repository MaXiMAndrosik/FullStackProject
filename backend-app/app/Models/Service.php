<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'code',
        'name',
        'type',
        'description',
        'calculation_type',
        'is_active'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Получить все тарифы для этой услуги.
     */
    public function tariffs(): HasMany
    {
        return $this->hasMany(Tariff::class);
    }

    /**
     * Получить текущий (последний) тариф.
     */
    public function currentTariff()
    {
        return $this->tariffs()
            ->orderByDesc('start_date')
            ->first();
    }

    /**
     * Scope для активных услуг.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Проверка, является ли услуга фиксированной.
     */
    public function isFixed(): bool
    {
        return $this->calculation_type === 'fixed';
    }

    /**
     * Проверка, является ли услуга счетчиковой.
     */
    public function isMeter(): bool
    {
        return $this->calculation_type === 'meter';
    }

    /**
     * Проверка, является ли услуга площадной.
     */
    public function isArea(): bool
    {
        return $this->calculation_type === 'area';
    }
}
