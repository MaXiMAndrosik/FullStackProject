<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Tariff extends Model
{

    use HasFactory;

    protected $fillable = [
        'service_id',
        'rate',
        'unit',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'rate' => 'decimal:4'
    ];

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
     * Проверить, является ли тариф будущим.
     */
    public function isFuture(): bool
    {
        return $this->start_date > Carbon::today();
    }

    /**
     * Проверить, является ли тариф устаревшим.
     */
    public function isExpired(): bool
    {
        return $this->end_date && $this->end_date < Carbon::today();
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
     * Scope для будущих тарифов.
     */
    public function scopeFuture(Builder $query): Builder
    {
        return $query->where('start_date', '>', Carbon::today());
    }

    /**
     * Scope для устаревших тарифов.
     */
    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('end_date', '<', Carbon::today());
    }

    /**
     * Scope для тарифов, которые можно удалить
     */
    public function scopeDeletable(Builder $query): Builder
    {
        return $this->scopeExpired($query);
    }
}
