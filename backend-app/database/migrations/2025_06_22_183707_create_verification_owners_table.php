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
        Schema::create('verification_owners', function (Blueprint $table) {
            $table->id();

            // Связь с пользователем
            $table->foreignId('user_id')
            ->constrained()
                ->onDelete('cascade')
                ->comment('Пользователь, отправивший запрос');

            // Данные для верификации
            $table->string('last_name', 100);
            $table->string('first_name', 100);
            $table->string('patronymic', 100);
            $table->date('birth_date');
            $table->string('phone', 20);
            $table->string('apartment_number', 10);

            // Статус обработки
            $table->enum('status', ['pending', 'approved', 'rejected'])
            ->default('pending')
            ->comment('Статус запроса');

            // Системные поля
            $table->text('verification_notes')->nullable()
                ->comment('Заметки при верификации');
            $table->timestamp('processed_at')->nullable();

            $table->timestamps();

            // Индексы
            $table->index('apartment_number');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verification_owners');
    }
};
