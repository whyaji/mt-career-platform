<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Program;
use App\Models\ProgramCategory;

class ProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pkppCategory = ProgramCategory::where('code', 'pkpp')->first();
        $internshipCategory = ProgramCategory::where('code', 'internship')->first();
        $apprenticeshipCategory = ProgramCategory::where('code', 'apprenticeship')->first();

        $programs = [
            // PKPP Programs
            [
                'code' => 'pkpp-estate',
                'name' => 'PKPP Estate',
                'program_category_id' => $pkppCategory->id,
                'description' => 'Program Kepemimpinan Perkebunan Pratama untuk Estate',
                'min_education' => Program::MIN_EDUCATION_D3,
                'majors' => ['Pertanian', 'Perkebunan', 'Agribisnis', 'Agroteknologi', 'Agroekoteknologi'],
                'min_gpa' => 2.75,
                'marital_status' => Program::MARITAL_STATUS_SINGLE,
                'placement' => 'Kalimantan Tengah',
                'training_duration' => 3,
                'ojt_duration' => 6,
                'contract_duration' => 12,
                'status' => Program::STATUS_ACTIVE,
            ],
            [
                'code' => 'pkpp-ktu',
                'name' => 'PKPP KTU',
                'program_category_id' => $pkppCategory->id,
                'description' => 'Program Kepemimpinan Perkebunan Pratama untuk KTU',
                'min_education' => Program::MIN_EDUCATION_D3,
                'majors' => ['Akuntansi', 'Perpajakan'],
                'min_gpa' => 2.75,
                'marital_status' => Program::MARITAL_STATUS_SINGLE,
                'placement' => 'Kalimantan Tengah',
                'training_duration' => 3,
                'ojt_duration' => 6,
                'contract_duration' => 12,
                'status' => Program::STATUS_ACTIVE,
            ],
            [
                'code' => 'pkpp-mill',
                'name' => 'PKPP Mill',
                'program_category_id' => $pkppCategory->id,
                'description' => 'Program Kepemimpinan Perkebunan Pratama untuk Mill',
                'min_education' => Program::MIN_EDUCATION_S1,
                'majors' => ['Teknik Mesin', 'Teknik Industri', 'Teknik Elektro', 'Teknik Kimia'],
                'min_gpa' => 2.75,
                'marital_status' => Program::MARITAL_STATUS_SINGLE,
                'placement' => 'Kalimantan Tengah',
                'training_duration' => 3,
                'ojt_duration' => 6,
                'contract_duration' => 12,
                'status' => Program::STATUS_ACTIVE,
            ],
            // Internship Programs
            [
                'code' => 'internship-tech',
                'name' => 'Tech Internship',
                'program_category_id' => $internshipCategory->id,
                'description' => 'Program Magang Teknologi',
                'min_education' => Program::MIN_EDUCATION_S1,
                'majors' => ['Teknik Informatika', 'Sistem Informasi', 'Ilmu Komputer'],
                'min_gpa' => 3.0,
                'marital_status' => Program::MARITAL_STATUS_ANY,
                'placement' => 'Jakarta',
                'training_duration' => 1,
                'ojt_duration' => 3,
                'contract_duration' => null,
                'status' => Program::STATUS_ACTIVE,
            ],
            // Apprenticeship Programs
            [
                'code' => 'apprenticeship-sales',
                'name' => 'Sales Apprenticeship',
                'program_category_id' => $apprenticeshipCategory->id,
                'description' => 'Program Pelatihan Sales',
                'min_education' => Program::MIN_EDUCATION_D3,
                'majors' => ['Manajemen', 'Pemasaran', 'Bisnis'],
                'min_gpa' => 2.5,
                'marital_status' => Program::MARITAL_STATUS_ANY,
                'placement' => 'Surabaya',
                'training_duration' => 2,
                'ojt_duration' => 4,
                'contract_duration' => 6,
                'status' => Program::STATUS_ACTIVE,
            ],
        ];

        foreach ($programs as $program) {
            Program::create($program);
        }
    }
}
