<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProgramCategory;

class ProgramCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'code' => 'pkpp',
                'name' => 'PKPP',
                'description' => 'Program Kepemimpinan Perkebunan Pratama',
                'status' => ProgramCategory::STATUS_ACTIVE,
            ],
            [
                'code' => 'internship',
                'name' => 'Internship',
                'description' => 'Program Magang untuk Mahasiswa',
                'status' => ProgramCategory::STATUS_ACTIVE,
            ],
            [
                'code' => 'apprenticeship',
                'name' => 'Apprenticeship',
                'description' => 'Program Pelatihan Kerja',
                'status' => ProgramCategory::STATUS_ACTIVE,
            ],
        ];

        foreach ($categories as $category) {
            ProgramCategory::create($category);
        }
    }
}
