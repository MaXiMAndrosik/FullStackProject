<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('service_meter_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->foreignId('meter_type_id')->constrained()->onDelete('cascade');
            $table->integer('order')->default(0)->comment('Порядок в списке');
            $table->boolean('is_required')->default(true)->comment('Обязателен ли счетчик для услуги');
            $table->timestamps();

            $table->unique(['service_id', 'meter_type_id']);
            $table->index(['service_id', 'order']);

            $table->comment('Связь услуг с типами счетчиков');
        });
    }

    public function down()
    {
        Schema::dropIfExists('service_meter_types');
    }
};
