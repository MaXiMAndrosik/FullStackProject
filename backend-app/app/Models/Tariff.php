<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class Tariff extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'service_id',
        'rate',
        'unit',
        'start_date',
        'end_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'rate' => 'decimal:4'
    ];

    /**
     * Получить услугу, к которой относится тариф.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Проверить, является ли тариф текущим (активным на сегодня).
     */
    public function isCurrent(): bool
    {
        $today = Carbon::today();

        return $this->start_date <= $today &&
            ($this->end_date === null || $this->end_date >= $today);
    }

    /**
     * Проверить, был ли тариф активен на указанную дату.
     */
    public function isActiveAt(Carbon $date): bool
    {
        return $this->start_date <= $date &&
            ($this->end_date === null || $this->end_date >= $date);
    }

    /**
     * Scope для активных тарифов на указанную дату.
     */
    public function scopeActiveAt(Builder $query, Carbon $date): Builder
    {
        return $query->where('start_date', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', $date);
            });
    }

    /**
     * Scope для текущих (активных сегодня) тарифов.
     */
    public function scopeCurrent(Builder $query): Builder
    {
        return $this->scopeActiveAt($query, Carbon::today());
    }

    /**
     * Scope для тарифов определенной услуги.
     */
    public function scopeForService(Builder $query, int $serviceId): Builder
    {
        return $query->where('service_id', $serviceId);
    }

    /**
     * Активировать тариф (установить как текущий).
     * Деактивирует предыдущий активный тариф.
     */
    public function activate(): void
    {
        // Деактивируем предыдущий активный тариф
        Tariff::forService($this->service_id)
            ->current()
            ->update(['end_date' => Carbon::yesterday()]);

        // Активируем текущий тариф
        $this->update([
            'start_date' => Carbon::today(),
            'end_date' => null
        ]);
    }
}
