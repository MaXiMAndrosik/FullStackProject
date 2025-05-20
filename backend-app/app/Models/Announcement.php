<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Announcement extends Model
{

    use HasFactory;

    protected $fillable = [
        'title',
        'message',
        'contacts',
        'signature',
        'publish',
        'date',
        'location',
        'necessity',
        'agenda',
        'documents',
        'expiresAt'
    ];

    // Добавляем преобразование для пустых значений
    protected $attributes = [
        'documents' => '[]',
        'agenda' => '[]'
    ];


    protected $casts = [
        'message' => 'array',
        'contacts' => 'array',
        'agenda' => 'array',
        'documents' => 'array',
        'publish' => 'datetime',
        'date' => 'datetime',
        'expiresAt' => 'datetime'
    ];
}