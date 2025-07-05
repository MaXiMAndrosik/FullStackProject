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
        Schema::create('service_assignments', function (Blueprint $table) {
            $table->id();
            $table->enum('scope', ['apartment', 'entrance'])->comment('Тип привязки: квартира/подъезд');
            $table->foreignId('apartment_id')->nullable()->constrained()->comment('Квартира (если услуга индивидуальная)');
            $table->integer('entrance')->nullable()->comment('Подъезд (если услуга общая)');
            $table->string('name', 100)->comment('Наименование услуги');
            $table->string('type', 20)->default('main')->comment('Тип услуги: main, utility, additional, other');
            $table->string('calculation_type', 20)->comment('Тип расчёта: fixed, meter, area');
            $table->boolean('is_active')->default(true)->comment('Подключена ли услуга');
            $table->timestamps();

            // Индексы для оптимизации
            $table->index('apartment_id');
            $table->index('entrance');
            $table->index('is_active');

            $table->comment('Индивидуальные настройки услуг для квартир/подъездов');

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

