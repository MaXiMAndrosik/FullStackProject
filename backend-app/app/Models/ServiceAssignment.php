<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

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

    public function apartment(): BelongsTo
    {
        return $this->belongsTo(Apartment::class);
    }

    /**
     * Получить тариф для этой услуги
     */
    public function tariff(): HasOne
    {
        return $this->hasOne(AssignmentTariff::class, 'assignment_id');
    }

    /**
     * Акцессоры
     */
    public function getTargetInfoAttribute()
    {
        if ($this->scope === 'apartment') {
            return $this->apartment
                ? 'Кв. ' . $this->apartment->number . ' (Подъезд ' . $this->apartment->entrance . ')'
                : 'Квартира не найдена';
        }
        return 'Подъезд ' . $this->entrance;
    }

    /**
     * Проверить, есть ли у услуги активный тариф
     */
    public function hasActiveTariff(): bool
    {
        if (!$this->tariff) {
            return false;
        }

        $today = Carbon::today();
        return ($this->tariff->start_date <= $today) &&
            (!$this->tariff->end_date || $this->tariff->end_date >= $today);
    }

    /**
     * Проверить, устарел ли тариф услуги
     */
    public function isTariffExpired(): bool
    {
        if (!$this->tariff) {
            return true;
        }

        $today = Carbon::today();
        return $this->tariff->end_date && $this->tariff->end_date < $today;
    }
}
