<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class MeterTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'unit' => 'm3',
            'description' => $this->faker->sentence(),
        ];
    }
}
