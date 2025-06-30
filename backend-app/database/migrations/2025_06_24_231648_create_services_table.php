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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique()->comment('Код услуги');
            $table->string('name', 100)->comment('Наименование услуги');
            $table->string('type', 20)->default('main')->comment('Тип услуги: main, utility, additional, other');
            $table->text('description')->nullable()->comment('Описание');
            $table->string('calculation_type', 20)->comment('Тип расчёта: fixed, meter, area');
            $table->boolean('is_active')->default(true)->comment('Активна ли услуга');
            $table->timestamps();

            $table->comment('Услуги ЖКХ');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
