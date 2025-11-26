<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class AssignmentTariff extends Model
{
    protected $fillable = [
        'assignment_id',
        'assignment_name',
        'rate',
        'unit',
        'start_date',
        'end_date'
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
    ];

    /**
     * Получить услугу, к которой относится тариф.
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(ServiceAssignment::class);
    }

    /**
     * Проверить, является ли тариф активным
     */
    public function isActive(): bool
    {
        $today = Carbon::today();
        return $this->start_date <= $today &&
            (!$this->end_date || $this->end_date >= $today);
    }

    /**
     * Проверить, является ли тариф будущим
     */
    public function isFuture(): bool
    {
        return $this->start_date > Carbon::today();
    }

    /**
     * Проверить, является ли тариф устаревшим
     */
    public function isExpired(): bool
    {
        return $this->end_date && $this->end_date < Carbon::today();
    }
}
