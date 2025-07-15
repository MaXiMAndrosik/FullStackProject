<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MeterType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'unit',
        'description'
    ];

    public function meters(): HasMany
    {
        return $this->hasMany(Meter::class, 'type_id');
    }
}
