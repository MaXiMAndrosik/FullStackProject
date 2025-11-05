<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeterReading extends Model
{
    use HasFactory;

    protected $fillable = [
        'meter_id',
        'period',
        'value',
        'is_fixed'
    ];

    protected $casts = [
        'period' => 'date',
        'value' => 'integer',
        'is_fixed' => 'boolean'
    ];

    public function apartment(): BelongsTo
    {
        return $this->belongsTo(Apartment::class);
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(MeterType::class, 'type_id');
    }

    public function meter(): BelongsTo
    {
        return $this->belongsTo(Meter::class);
    }
}
