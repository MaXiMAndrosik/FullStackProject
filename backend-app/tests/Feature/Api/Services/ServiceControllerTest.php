<?php

namespace Tests\Feature\Api\Services;

use Tests\TestCase;
use App\Models\Service;
use App\Models\Tariff;
use App\Models\MeterType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use PHPUnit\Framework\Attributes\Test;
use Illuminate\Foundation\Testing\WithoutMiddleware;

class ServiceControllerTest extends TestCase
{
    use RefreshDatabase, WithoutMiddleware;

    protected array $serviceData;
    protected Collection $meterTypes;

    protected function setUp(): void
    {
        parent::setUp();

        // Создаем тестовые данные
        $this->meterTypes = MeterType::factory()->count(2)->create();
        $this->serviceData = [
            'code' => 'test-service',
            'name' => 'Test Service',
            'type' => 'maintenance',
            'description' => 'Test description',
            'calculation_type' => 'meter',
            'meter_type_ids' => [$this->meterTypes[0]->id],
            'is_active' => true
        ];
    }

    #[Test]
    public function it_creates_service_with_initial_tariff()
    {
        $response = $this->postJson('/api/admin/services', $this->serviceData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Услуга успешно создана.'
            ]);

        // Проверяем, что услуга создана
        $this->assertDatabaseHas('services', [
            'code' => 'test-service',
            'calculation_type' => 'meter'
        ]);

        // Проверяем, что создан начальный тариф
        $service = Service::where('code', 'test-service')->first();
        $this->assertDatabaseHas('tariffs', [
            'service_id' => $service->id,
            'rate' => 0.0000,
            'start_date' => Carbon::today(),
            'end_date' => null
        ]);
    }

    #[Test]
    public function it_updates_service_without_calculation_type_change()
    {
        $service = Service::factory()->create([
            'calculation_type' => 'meter',
            'type' => 'maintenance'
        ]);

        // Сохраним исходное имя для отладки
        $originalName = $service->name;

        $updateData = [
            'name' => 'Updated Service Name',
            'description' => 'Updated description',
            'type' => 'maintenance'
        ];

        $response = $this->putJson("/api/admin/services/{$service->id}", $updateData);

        // Отладочная информация
        dump("Original name: " . $originalName);
        dump("Response status: " . $response->status());
        dump("Response content: " . $response->getContent());

        // Обновим модель из базы для проверки
        $service->refresh();
        dump("Service name after update: " . $service->name);

        // Проверим базу данных напрямую
        $dbService = Service::find($service->id);
        dump("Database service name: " . $dbService->name);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Услуга успешно обновлена.'
            ]);

        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'name' => 'Updated Service Name'
        ]);
    }

    #[Test]
    public function it_creates_new_tariff_when_calculation_type_changes()
    {
        $service = Service::factory()->create([
            'calculation_type' => 'fixed',
            'type' => 'maintenance'

        ]);

        // Создаем активный тариф
        $activeTariff = Tariff::factory()->create([
            'service_id' => $service->id,
            'rate' => 100.00,
            'start_date' => Carbon::yesterday(),
            'end_date' => null
        ]);

        $updateData = [
            'calculation_type' => 'meter',
            'meter_type_ids' => [$this->meterTypes[0]->id]
        ];

        $response = $this->putJson("/api/admin/services/{$service->id}", $updateData);

        $response->assertStatus(200);

        // Проверяем, что старый тариф закрыт
        $this->assertDatabaseHas('tariffs', [
            'id' => $activeTariff->id,
            'end_date' => Carbon::yesterday()
        ]);

        // Проверяем, что создан новый тариф
        $this->assertDatabaseHas('tariffs', [
            'service_id' => $service->id,
            'rate' => 0.0000,
            'start_date' => Carbon::today(),
            'end_date' => null
        ]);
    }

    #[Test]
    public function it_validates_required_fields()
    {
        $response = $this->postJson('/api/admin/services', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code', 'name', 'type', 'calculation_type']);
    }
}
