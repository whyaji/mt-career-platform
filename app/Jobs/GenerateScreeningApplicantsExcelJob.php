<?php

namespace App\Jobs;

use App\Models\Batch;
use App\Models\ScreeningApplicant;
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

class GenerateScreeningApplicantsExcelJob implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    protected $batchId;
    protected $generatedFileId;

    public function __construct($batchId, $generatedFileId)
    {
        $this->batchId = $batchId;
        $this->generatedFileId = $generatedFileId;
    }

    public function handle()
    {
        try {
            Log::info("Starting Excel generation for batch: {$this->batchId}");

            // Get the generated file record
            $generatedFile = GeneratedFile::find($this->generatedFileId);
            if (!$generatedFile) {
                Log::error("Generated file record not found: {$this->generatedFileId}");
                return;
            }

            // Get batch with questions
            $batch = Batch::with(['questions', 'programCategory'])->find($this->batchId);
            if (!$batch) {
                Log::error("Batch not found: {$this->batchId}");
                return;
            }

            // Get all screening applicants for this batch
            $screeningApplicants = ScreeningApplicant::where('batch_id', $this->batchId)
                ->orderBy('created_at', 'desc')
                ->get();

            // Create spreadsheet
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Set basic information
            $sheet->setTitle('Screening Applicants');

            // Define headers
            $headers = [
                'ID',
                'Status',
                'Score',
                'Submitted Date',
            ];

            // Add dynamic question headers
            if ($batch->questions) {
                foreach ($batch->questions as $question) {
                    $headers[] = $question->label;
                }
            }

            // Add remaining headers
            $headers = array_merge($headers, [
                'IP Address',
                'User Agent',
                'Total Score',
                'Max Score',
                'Total Marking',
                'AI Scoring',
            ]);

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
            foreach ($screeningApplicants as $applicant) {
                $colIndex = 1; // Start with column 1 (A)

                // ID (last 8 characters)
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, substr($applicant->id, -8));

                // Status
                $statusLabels = [
                    0 => 'Pending',
                    1 => 'Scored',
                    2 => 'Approved',
                    3 => 'Rejected'
                ];
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $statusLabels[$applicant->status] ?? 'Unknown');

                // Score
                if ($applicant->total_score !== null && $applicant->max_score !== null && $applicant->max_score > 0) {
                    $percentage = round(($applicant->total_score / $applicant->max_score) * 100, 1);
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, "{$applicant->total_score}/{$applicant->max_score} ({$percentage}%)");
                } else {
                    $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, '-');
                }

                // Submitted Date
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, Carbon::parse($applicant->created_at)->format('M d, Y H:i'));

                // Dynamic question answers
                if ($batch->questions) {
                    foreach ($batch->questions as $question) {
                        $answerObj = collect($applicant->answers)->firstWhere('question_code', $question->code);
                        $answer = $answerObj ? $answerObj['answer'] : '-';

                        // Format answer
                        if (is_array($answer)) {
                            $answer = implode(', ', $answer);
                        } elseif (is_bool($answer)) {
                            $answer = $answer ? 'Yes' : 'No';
                        } elseif (is_string($answer) && strlen($answer) > 100) {
                            $answer = substr($answer, 0, 100) . '...';
                        }

                        $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $answer);
                    }
                }

                // Additional data
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $applicant->ip_address ?? '-');
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, substr($applicant->user_agent ?? '-', 0, 50));
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $applicant->total_score ?? '-');
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $applicant->max_score ?? '-');
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $applicant->total_marking ?? '-');
                $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIndex++) . $row, $applicant->total_ai_scoring ?? '-');

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
            $directory = "generated/open-program/{$this->batchId}";
            $fullDirectory = public_path($directory);
            if (!file_exists($fullDirectory)) {
                mkdir($fullDirectory, 0755, true);
            }

            // Generate filename
            $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
            $filename = "screening-applicants-batch-{$this->batchId}-{$timestamp}.xlsx";
            $filePath = "{$directory}/{$filename}";

            // Save file
            $writer = new Xlsx($spreadsheet);
            $writer->save(public_path($filePath));

            // Update generated file record
            $generatedFile->update([
                'path' => $filePath,
                'ext' => 'xlsx'
            ]);

            Log::info("Excel file generated successfully: {$filePath}");
        } catch (\Exception $e) {
            Log::error("Error generating Excel file: {$e->getMessage()}");
            Log::error($e->getTraceAsString());

            // Update generated file record to indicate failure
            if (isset($generatedFile)) {
                $generatedFile->delete();
            }
        }
    }

    public function failed(\Throwable $exception)
    {
        Log::error("Excel generation job failed: {$exception->getMessage()}");

        // Clean up generated file record on failure
        if ($this->generatedFileId) {
            $generatedFile = GeneratedFile::find($this->generatedFileId);
            if ($generatedFile) {
                $generatedFile->delete();
            }
        }
    }
}
