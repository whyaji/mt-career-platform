<?php

namespace App\Jobs;

use App\Models\ApplicantData;
use App\Models\GeneratedFile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use Carbon\Carbon;

class GenerateApplicationsExcelJob implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    protected $generatedFileId;

    public function __construct($generatedFileId)
    {
        $this->generatedFileId = $generatedFileId;
    }

    public function handle()
    {
        try {
            Log::info("Starting Excel generation for applications");

            // Get the generated file record
            $generatedFile = GeneratedFile::find($this->generatedFileId);
            if (!$generatedFile) {
                Log::error("Generated file record not found: {$this->generatedFileId}");
                return;
            }

            // Get all applications with batch relationship
            $applications = ApplicantData::with('batch')
                ->orderBy('created_at', 'desc')
                ->get();

            // Create spreadsheet
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Set basic information
            $sheet->setTitle('Applications');

            // Define headers
            $headers = [
                'ID',
                'Full Name',
                'Email',
                'WhatsApp',
                'NIK',
                'Gender',
                'Place of Birth',
                'Date of Birth',
                'Age',
                'Region of Birth',
                'Province of Birth',
                'Height',
                'Weight',
                'Residence Region',
                'Residence Province',
                'Residence City',
                'Residence Address',
                'Selected Program',
                'Education Major',
                'Education Level',
                'Educational Institution',
                'NIM',
                'Diploma Status',
                'Marital Status',
                'Continue Education',
                'Clothing Size',
                'Medical History',
                'Batch',
                'Applied Date',
            ];

            // Write headers
            $col = 'A';
            foreach ($headers as $header) {
                $sheet->setCellValue($col . '1', $header);
                $col++;
            }

            // Style headers
            $headerRange = 'A1:' . $col . '1';
            $sheet->getStyle($headerRange)->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4472C4']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
            ]);

            // Write data
            $row = 2;
            foreach ($applications as $application) {
                $colIndex = 1; // Start with column 1 (A)

                // ID (last 8 characters)
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, substr($application->id, -8));

                // Full Name
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->nama_lengkap ?? '-');

                // Email
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->email ?? '-');

                // WhatsApp
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->nomor_whatsapp ?? '-');

                // NIK
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->nik ?? '-');

                // Gender
                $gender = $application->jenis_kelamin === 'L' ? 'Male' : ($application->jenis_kelamin === 'P' ? 'Female' : '-');
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $gender);

                // Place of Birth
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->tempat_lahir ?? '-');

                // Date of Birth
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->tanggal_lahir ? Carbon::parse($application->tanggal_lahir)->format('M d, Y') : '-');

                // Age
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->usia ?? '-');

                // Region of Birth
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->daerah_lahir ?? '-');

                // Province of Birth
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->provinsi_lahir ?? '-');

                // Height
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->tinggi_badan ? $application->tinggi_badan . ' cm' : '-');

                // Weight
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->berat_badan ? $application->berat_badan . ' kg' : '-');

                // Residence Region
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->daerah_domisili ?? '-');

                // Residence Province
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->provinsi_domisili ?? '-');

                // Residence City
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->kota_domisili ?? '-');

                // Residence Address
                $address = $application->alamat_domisili;
                if (is_string($address) && strlen($address) > 100) {
                    $address = substr($address, 0, 100) . '...';
                }
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $address ?? '-');

                // Selected Program
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->program_terpilih ?? '-');

                // Education Major
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->jurusan_pendidikan ?? '-');

                // Education Level
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->jenjang_pendidikan ?? '-');

                // Educational Institution
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->instansi_pendidikan ?? '-');

                // NIM
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->nim ?? '-');

                // Diploma Status
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->status_ijazah ?? '-');

                // Marital Status
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->status_perkawinan ?? '-');

                // Continue Education
                $continueEducation = $application->melanjutkan_pendidikan ? 'Yes' : 'No';
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $continueEducation);

                // Clothing Size
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $application->ukuran_baju ?? '-');

                // Medical History
                $medicalHistory = $application->riwayat_penyakit;
                if (is_string($medicalHistory) && strlen($medicalHistory) > 100) {
                    $medicalHistory = substr($medicalHistory, 0, 100) . '...';
                }
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $medicalHistory ?? '-');

                // Batch
                $batchInfo = $application->batch ?
                    "{$application->batch->number} - {$application->batch->location} ({$application->batch->year})" :
                    'N/A';
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $batchInfo);

                // Applied Date
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, Carbon::parse($application->created_at)->format('M d, Y H:i'));

                $row++;
            }

            // Auto-size columns
            for ($i = 1; $i <= $colIndex; $i++) {
                $columnID = Coordinate::stringFromColumnIndex($i);
                $sheet->getColumnDimension($columnID)->setAutoSize(true);
            }

            // Add borders to all data
            $lastColumnLetter = Coordinate::stringFromColumnIndex($colIndex);
            $dataRange = 'A1:' . $lastColumnLetter . ($row - 1);
            $sheet->getStyle($dataRange)->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
            ]);

            // Create directory if it doesn't exist
            $directory = "generated/applications";
            $fullDirectory = public_path($directory);
            if (!file_exists($fullDirectory)) {
                mkdir($fullDirectory, 0755, true);
            }

            // Generate filename
            $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
            $filename = "applications-{$timestamp}.xlsx";
            $filePath = "{$directory}/{$filename}";

            // Save file
            $writer = new Xlsx($spreadsheet);
            $writer->save(public_path($filePath));

            // Update generated file record
            $generatedFile->update([
                'path' => $filePath,
                'ext' => 'xlsx'
            ]);

            Log::info("Applications Excel file generated successfully: {$filePath}");
        } catch (\Exception $e) {
            Log::error("Error generating applications Excel file: {$e->getMessage()}");
            Log::error($e->getTraceAsString());

            // Update generated file record to indicate failure
            if (isset($generatedFile)) {
                $generatedFile->delete();
            }
        }
    }

    public function failed(\Throwable $exception)
    {
        Log::error("Applications Excel generation job failed: {$exception->getMessage()}");

        // Clean up generated file record on failure
        if ($this->generatedFileId) {
            $generatedFile = GeneratedFile::find($this->generatedFileId);
            if ($generatedFile) {
                $generatedFile->delete();
            }
        }
    }
}
