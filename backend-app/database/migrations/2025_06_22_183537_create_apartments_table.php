<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('apartments', function (Blueprint $table) {
            $table->id();
            $table->string('number', 10)->unique()->comment('Номер квартиры');
            $table->decimal('area', 8, 2)->comment('Площадь квартиры (м²)');
            $table->integer('entrance')->nullable()->comment('Подъезд');
            $table->integer('floor')->comment('Этаж');
            $table->integer('rooms')->comment('Количество комнат');
            $table->timestamps();

            $table->comment('Характеристики квартир');

            // Индексы для часто используемых полей
            $table->index('number');
            $table->index('entrance');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apartments');
    }
};
