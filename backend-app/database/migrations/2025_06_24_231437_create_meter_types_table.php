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
        Schema::create('meter_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->comment('Наименование типа');
            $table->string('unit', 20)->comment('Единица измерения');
            $table->text('description')->nullable()->comment('Описание');
            $table->timestamps();

            $table->comment('Типы счётчиков ресурсов');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meter_types');
    }
};
