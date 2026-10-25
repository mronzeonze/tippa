<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SpecializationSeeder extends Seeder
{
    public function run(): void
    {
        $specializations = [
            [
                'name' => 'Phytothérapie',
                'slug' => 'phytotherapie',
                'description' => 'Utilisation des plantes médicinales',
                'icon' => '🌿',
            ],
            [
                'name' => 'Massage traditionnel',
                'slug' => 'massage-traditionnel',
                'description' => 'Techniques de massage ancestrales',
                'icon' => '💆',
            ],
            [
                'name' => 'Guérison spirituelle',
                'slug' => 'guerison-spirituelle',
                'description' => 'Pratiques spirituelles de guérison',
                'icon' => '✨',
            ],
            [
                'name' => 'Acupuncture',
                'slug' => 'acupuncture',
                'description' => 'Stimulation de points énergétiques',
                'icon' => '💉',
            ],
            [
                'name' => 'Herboristerie',
                'slug' => 'herboristerie',
                'description' => 'Préparation de remèdes naturels',
                'icon' => '🍵',
            ],
        ];

        foreach ($specializations as $spec) {
            DB::table('specializations')->insert([
                'name' => $spec['name'],
                'slug' => $spec['slug'],
                'description' => $spec['description'],
                'icon' => $spec['icon'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}