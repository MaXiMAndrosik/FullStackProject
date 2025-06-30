<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class ServiceAssignment extends Model
{
    protected $fillable = [
        'scope',
        'apartment_id',
        'entrance',
        'name',
        'type',
        'calculation_type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Отношения
    public function apartment(): BelongsTo
    {
        return $this->belongsTo(Apartment::class);
    }

    /**
     * Получить все тарифы для этой услуги.
     */
    public function tariffs(): HasMany
    {
        return $this->hasMany(AssignmentTariff::class, 'assignment_id');
    }

    /**
     * Получить текущий активный тариф.
     */
    public function getCurrentTariffAttribute()
    {
        $today = Carbon::today();

        return $this->tariffs()
            ->where('start_date', '<=', $today)
            ->where(function ($query) use ($today) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', $today);
            })
            ->orderBy('start_date', 'desc')
            ->first();
    }

    // Акцессоры
    public function getTargetInfoAttribute()
    {
        if ($this->scope === 'apartment') {
            return $this->apartment
                ? 'Кв. ' . $this->apartment->number . ' (Подъезд ' . $this->apartment->entrance . ')'
                : 'Квартира не найдена';
        }
        return 'Подъезд ' . $this->entrance;
    }
}
