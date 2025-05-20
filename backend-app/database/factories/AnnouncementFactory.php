<?php

namespace Database\Factories;

use App\Models\Announcement;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnnouncementFactory extends Factory
{
    protected $model = Announcement::class;

    public function definition()
    {
        return [
            'title' => $this->faker->sentence,
            'message' => json_encode([$this->faker->paragraph]),
            'contacts' => json_encode([
                'phone' => $this->faker->phoneNumber,
                'email' => $this->faker->email
            ]),
            'signature' => $this->faker->name,
            'publish' => $this->faker->dateTimeThisYear,
            'date' => $this->faker->optional()->dateTimeThisMonth,
            'location' => $this->faker->optional()->address,
            'necessity' => $this->faker->optional()->word,
            'agenda' => json_encode($this->faker->words(3)),
            'documents' => json_encode([
                [
                    'name' => $this->faker->word . '.pdf',
                    'url' => '/documents/' . $this->faker->word . '.pdf'
                ]
            ]),
            'expiresAt' => $this->faker->dateTimeBetween('now', '+1 year')
        ];
    }
}
