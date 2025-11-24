<?php

namespace Tests\Feature\Api\Services;

use Tests\TestCase;
use App\Models\Service;
use App\Models\Tariff;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;
use PHPUnit\Framework\Attributes\Test;
use Illuminate\Foundation\Testing\WithoutMiddleware;


class TariffControllerTest extends TestCase
{
    use RefreshDatabase, WithoutMiddleware;

    protected Service $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = Service::factory()->create();
    }

    #[Test]
    public function it_creates_tariff_successfully()
    {
        $tariffData = [
            'service_id' => $this->service->id,
            'rate' => 150.50,
            'unit' => 'm3',
            'start_date' => '2024-01-01',
            'end_date' => null
        ];

        $response = $this->postJson('/api/admin/tariffs', $tariffData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Тариф успешно создан.'
            ]);

        $this->assertDatabaseHas('tariffs', [
            'service_id' => $this->service->id,
            'rate' => 150.50,
            'start_date' => '2024-01-01'
        ]);
    }

    #[Test]
    public function it_updates_tariff_rate_without_end_date()
    {
        $tariff = Tariff::factory()->create([
            'service_id' => $this->service->id,
            'rate' => 100.00,
            'start_date' => Carbon::today(),
            'end_date' => null
        ]);

        $updateData = [
            'rate' => 200.00,
            'start_date' => $tariff->start_date->format('Y-m-d'),
            'end_date' => null
        ];

        $response = $this->putJson("/api/admin/tariffs/{$tariff->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Тариф успешно обновлен.'
            ]);

        $this->assertDatabaseHas('tariffs', [
            'id' => $tariff->id,
            'rate' => 200.00
        ]);
    }

    #[Test]
    public function it_creates_new_tariff_when_setting_end_date()
    {
        $tariff = Tariff::factory()->create([
            'service_id' => $this->service->id,
            'rate' => 100.00,
            'start_date' => '2024-01-01',
            'end_date' => null
        ]);

        $updateData = [
            'rate' => 150.00,
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31'
        ];

        $response = $this->putJson("/api/admin/tariffs/{$tariff->id}", $updateData);

        $response->assertStatus(200);

        // Проверяем, что текущий тариф обновлен
        $this->assertDatabaseHas('tariffs', [
            'id' => $tariff->id,
            'end_date' => '2024-12-31'
        ]);

        // Проверяем, что создан новый тариф
        $this->assertDatabaseHas('tariffs', [
            'service_id' => $this->service->id,
            'rate' => 0.0000,
            'start_date' => '2025-01-01', // end_date + 1 день
            'end_date' => null
        ]);
    }

    #[Test]
    public function it_updates_next_tariff_when_changing_end_date()
    {
        // Создаем цепочку тарифов
        $firstTariff = Tariff::factory()->create([
            'service_id' => $this->service->id,
            'rate' => 100.00,
            'start_date' => '2024-01-01',
            'end_date' => '2024-06-30'
        ]);

        $secondTariff = Tariff::factory()->create([
            'service_id' => $this->service->id,
            'rate' => 120.00,
            'start_date' => '2024-07-01', // следующий день после end_date первого тарифа
            'end_date' => null
        ]);

        // Меняем end_date первого тарифа
        $updateData = [
            'rate' => 110.00,
            'start_date' => '2024-01-01',
            'end_date' => '2024-05-31' // меняем на более раннюю дату
        ];

        $response = $this->putJson("/api/admin/tariffs/{$firstTariff->id}", $updateData);

        $response->assertStatus(200);

        // Проверяем, что второй тариф обновил start_date
        $this->assertDatabaseHas('tariffs', [
            'id' => $secondTariff->id,
            'start_date' => '2024-06-01' // новый end_date + 1 день
        ]);
    }

    #[Test]
    public function it_prevents_start_date_change()
    {
        $tariff = Tariff::factory()->create([
            'service_id' => $this->service->id,
            'start_date' => '2024-01-01',
            'end_date' => null
        ]);

        $updateData = [
            'rate' => 200.00,
            'start_date' => '2024-02-01', // Пытаемся изменить дату начала
            'end_date' => null
        ];

        $response = $this->putJson("/api/admin/tariffs/{$tariff->id}", $updateData);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Невозможно обновить тариф.'
            ])
            ->assertJsonValidationErrors(['start_date']);
    }

    #[Test]
    public function it_prevents_editing_expired_tariff()
    {
        $tariff = Tariff::factory()->create([
            'service_id' => $this->service->id,
            'start_date' => '2023-01-01',
            'end_date' => '2023-12-31' // Прошедший период
        ]);

        $updateData = [
            'rate' => 200.00,
            'start_date' => '2023-01-01',
            'end_date' => '2023-12-31'
        ];

        $response = $this->putJson("/api/admin/tariffs/{$tariff->id}", $updateData);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Нельзя редактировать архивный тариф.'
            ]);
    }

    #[Test]
    public function it_validates_tariff_data()
    {
        $response = $this->postJson('/api/admin/tariffs', [
            'rate' => -100, // отрицательная ставка
            'start_date' => 'invalid-date',
            'end_date' => '2023-01-01' // раньше start_date
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['rate', 'start_date', 'end_date', 'service_id']);
    }

    #[Test]
    public function it_prevents_date_overlap_when_creating_tariff()
    {
        // Создаем существующий тариф
        Tariff::factory()->create([
            'service_id' => $this->service->id,
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31'
        ]);

        // Пытаемся создать пересекающийся тариф
        $tariffData = [
            'service_id' => $this->service->id,
            'rate' => 150.50,
            'unit' => 'm3',
            'start_date' => '2024-06-01', // пересекается с существующим
            'end_date' => '2025-06-01'
        ];

        $response = $this->postJson('/api/admin/tariffs', $tariffData);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Невозможно создать тариф из-за конфликта дат.'
            ]);
    }

    #[Test]
    public function it_handles_end_date_in_past()
    {
        $tariff = Tariff::factory()->create([
            'service_id' => $this->service->id,
            'start_date' => '2024-01-01',
            'end_date' => null
        ]);

        $updateData = [
            'rate' => 150.00,
            'start_date' => '2024-01-01',
            'end_date' => '2023-12-31' // Прошедшая дата
        ];

        $response = $this->putJson("/api/admin/tariffs/{$tariff->id}", $updateData);

        $response->assertStatus(422) // Ошибка валидации - end_date после start_date
            ->assertJsonValidationErrors(['end_date']);
    }

    #[Test]
    public function it_handles_concurrent_tariff_updates()
    {
        $tariff = Tariff::factory()->create([
            'service_id' => $this->service->id,
            'start_date' => '2024-01-01',
            'end_date' => null
        ]);

        // Симуляция конкурентных запросов
        $responses = [];
        for ($i = 0; $i < 3; $i++) {
            $responses[] = $this->putJson("/api/admin/tariffs/{$tariff->id}", [
                'rate' => 100 + $i,
                'start_date' => '2024-01-01',
                'end_date' => null
            ]);
        }

        // Все запросы должны завершиться успешно
        foreach ($responses as $response) {
            $response->assertStatus(200);
        }
    }
}
