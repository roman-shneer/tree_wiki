<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Strain>
 */
class StrainFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => 1,
            'name' => 'My test strain',
            'description' => 'My test strain description',
            'image' => '',
            'updated'=>'2024-06-25 12:41:48',
            'name_alter' => '',
            'potencyMin'=> 0.47,
            'potencyMax'=>0.84,
            'cultivation'=>0
        ];
    }
}
