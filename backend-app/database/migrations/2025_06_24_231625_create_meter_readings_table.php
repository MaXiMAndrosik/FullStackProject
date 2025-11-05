<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('meter_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meter_id')->constrained()->comment('Счётчик');
            $table->date('period')->comment('Период показаний (YYYY-MM-25)');
            $table->integer('value')->comment('Значение показаний');
            $table->boolean('is_fixed')->default(false)->comment('Запрет изменений');
            $table->timestamps();

            $table->unique(['meter_id', 'period']);
            $table->index('period');
            $table->comment('Показания счётчиков');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meter_readings');
    }
};
