<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => $this->faker->unique()->word(),
            'name' => $this->faker->word(),
            'type' => 'maintenance',
            'description' => $this->faker->sentence(),
            'calculation_type' => 'fixed',
            'is_active' => true,
        ];
    }
}
