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
        Schema::create('tariffs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->onDelete('cascade')->comment('Услуга');
            $table->decimal('rate', 10, 4)->comment('Значение тарифа');
            $table->string('unit', 20)->default('fixed')->comment('Единица измерения: m2, gcal, m3, kwh, fixed');
            $table->date('start_date')->comment('Дата начала действия');
            $table->date('end_date')->nullable()->comment('Дата окончания действия');
            $table->timestamps();

            $table->comment('История тарифов услуг');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tariffs');
    }
};
