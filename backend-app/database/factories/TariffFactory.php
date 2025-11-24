<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Service;

class TariffFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'service_id' => Service::factory(),
            'rate' => $this->faker->randomFloat(4, 0, 1000),
            'unit' => 'm3',
            'start_date' => $this->faker->date(),
            'end_date' => null,
        ];
    }

    public function expired()
    {
        return $this->state(function (array $attributes) {
            return [
                'start_date' => now()->subYear(),
                'end_date' => now()->subMonth(),
            ];
        });
    }

    public function future()
    {
        return $this->state(function (array $attributes) {
            return [
                'start_date' => now()->addMonth(),
                'end_date' => null,
            ];
        });
    }
}
