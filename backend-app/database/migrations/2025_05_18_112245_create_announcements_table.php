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
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->json('message');
            $table->json('contacts');
            $table->string('signature');
            $table->dateTime('publish');
            $table->dateTime('date')->nullable();
            $table->string('location')->nullable();
            $table->string('necessity')->nullable();
            $table->json('documents')->nullable();
            $table->json('agenda')->nullable();
            $table->dateTime('expiresAt');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
