<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssignmentTariff extends Model
{
    protected $fillable = [
        'assignment_id',
        'rate',
        'unit',
        'start_date',
        'end_date'
    ];

    /**
     * Получить услугу, к которой относится тариф.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(ServiceAssignment::class);
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(ServiceAssignment::class);
    }
}
