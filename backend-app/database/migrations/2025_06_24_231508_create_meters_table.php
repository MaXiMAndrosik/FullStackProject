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
        Schema::create('meters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('apartment_id')->constrained()->comment('Квартира');
            $table->foreignId('type_id')->constrained('meter_types')->comment('Тип счётчика');
            $table->string('serial_number')->unique()->comment('Серийный номер');
            $table->date('installation_date')->comment('Дата установки');
            $table->date('next_verification_date')->nullable()->comment('Дата след. поверки');
            $table->boolean('is_active')->default(true)->comment('Активен ли счётчик');
            $table->timestamps();

            $table->comment('Счётчики ресурсов');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meters');
    }
};
