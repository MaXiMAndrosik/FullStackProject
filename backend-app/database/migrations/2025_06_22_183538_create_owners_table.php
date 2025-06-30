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
        Schema::create('owners', function (Blueprint $table) {
            // Первичный ключ
            $table->id()->comment('Уникальный идентификатор владельца');

            // Связь с пользователем
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('cascade')
                ->comment('Связанный пользователь');

            // Персональные данные
            $table->string('last_name', 100);
            $table->string('first_name', 100);
            $table->string('patronymic', 100);
            $table->date('birth_date')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('telegram', 50)
                ->nullable();

            // Данные о собственности
            $table->foreignId('apartment_id')
                ->nullable()
                ->constrained('apartments')
                ->comment('Привязка к квартире');
            $table->date('ownership_start_date')
                ->comment('Дата начала владения');
            $table->date('ownership_end_date')
                ->nullable()
                ->comment('Дата окончания владения (NULL = текущий владелец)');

            // Статус верификации
            $table->boolean('is_verified')
                ->default(false)
                ->comment('Флаг подтверждения верификации');
            $table->timestamp('verified_at')
                ->nullable()
                ->comment('Дата и время подтверждения верификации');

            // Таймстампы
            $table->dateTime('created_at');
            $table->dateTime('updated_at');

            // Индексы
            $table->index('apartment_id', 'idx_owners_apartment_id');
            $table->index('is_verified', 'idx_owners_is_verified');
            $table->index(['apartment_id', 'ownership_end_date'], 'idx_current_owners');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('owners');
    }
};
