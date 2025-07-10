<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerificationOwners extends Model
{
    protected $fillable = [
        'user_id',
        'last_name',
        'first_name',
        'patronymic',
        'birth_date',
        'phone',
        'apartment_number',
        'status',
        'verification_notes'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'passport_issued_date' => 'date',
        'processed_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getFullNameAttribute()
    {
        return trim("{$this->last_name} {$this->first_name} {$this->patronymic}");
    }
}
