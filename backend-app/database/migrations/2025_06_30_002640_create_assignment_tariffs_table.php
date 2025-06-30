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
        Schema::create('assignment_tariffs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('service_assignments')->onDelete('cascade');
            $table->decimal('rate', 10, 4)->comment('Значение тарифа');
            $table->string('unit', 20)->default('fixed')->comment('Единица измерения: m2, gcal, m3, kwh, fixed');
            $table->date('start_date')->comment('Дата начала действия');
            $table->date('end_date')->nullable()->comment('Дата окончания действия');
            $table->timestamps();

            $table->index('start_date');
            $table->index('end_date');

            $table->comment('Тарифы для индивидуальных настроек услуг');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignment_tariffs');
    }
};
