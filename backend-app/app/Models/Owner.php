<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Owner extends Model
{
    protected $fillable = [
        'user_id',
        'full_name',
        'birth_date',
        'phone',
        'telegram',
        'apartment_number',
        'ownership_document_path',
        'ownership_start_date',
        'ownership_end_date',
        'is_verified',
        'verified_by',
        'verified_at'
    ];

    protected $casts = [
        'birth_date' => 'date:Y-m-d',
        'passport_issued_date' => 'date:Y-m-d',
        'ownership_start_date' => 'date:Y-m-d',
        'ownership_end_date' => 'date:Y-m-d',
        'verified_at' => 'datetime',
        'is_verified' => 'boolean'
    ];

    /**
     * Отношения
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verification_status');
    }
    public function apartment()
    {
        return $this->belongsTo(Apartment::class);
    }

    /**
     * Проверка является ли текущим владельцем
     */
    public function isCurrentOwner(): bool
    {
        return is_null($this->ownership_end_date);
    }

    /**
     * Получение текущих владельцев квартиры
     */
    public static function getCurrentOwners(string $apartmentNumber)
    {
        return static::where('apartment_number', $apartmentNumber)
            ->whereNull('ownership_end_date')
            ->get();
    }
}
