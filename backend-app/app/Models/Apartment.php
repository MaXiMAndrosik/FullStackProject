<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Apartment extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'area',
        'floor',
        'entrance',
        'rooms'
    ];

    protected $casts = [
        'area' => 'decimal:2',
    ];

    public function assignments()
    {
        return $this->hasMany(ServiceAssignment::class);
    }

    public function owners()
    {
        return $this->hasMany(Owner::class);
    }
}
