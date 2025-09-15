<?php

namespace Database\Seeders;

use App\Models\Batch;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BatchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $batches = [
            [
                'id' => Str::uuid(),
                'number' => 1,
                'number_code' => 'BATCH-001',
                'location' => 'Jakarta',
                'location_code' => 'JKT',
                'year' => 2024,
                'status' => Batch::STATUS_ACTIVE,
            ],
            [
                'id' => Str::uuid(),
                'number' => 2,
                'number_code' => 'BATCH-002',
                'location' => 'Surabaya',
                'location_code' => 'SBY',
                'year' => 2024,
                'status' => Batch::STATUS_ACTIVE,
            ],
            [
                'id' => Str::uuid(),
                'number' => 3,
                'number_code' => 'BATCH-003',
                'location' => 'Medan',
                'location_code' => 'MDN',
                'year' => 2024,
                'status' => Batch::STATUS_INACTIVE,
            ],
        ];

        foreach ($batches as $batch) {
            Batch::create($batch);
        }
    }
}
