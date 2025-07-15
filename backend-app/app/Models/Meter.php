<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Meter extends Model
{
    use HasFactory;

    protected $fillable = [
        'apartment_id',
        'type_id',
        'serial_number',
        'installation_date',
        'next_verification_date',
        'is_active'
    ];

    protected $casts = [
        'installation_date' => 'date:Y-m-d',
        'next_verification_date' => 'date:Y-m-d',
        'is_active' => 'boolean'
    ];

    public function apartment(): BelongsTo
    {
        return $this->belongsTo(Apartment::class);
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(MeterType::class, 'type_id');
    }
}
