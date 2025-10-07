<?php

namespace App\Jobs;

use App\Models\ApplicantData;
use App\Models\JobStatus;
use App\Services\PDDIKTIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ApplicantScreeningJob implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    protected $applicantDataId;
    protected $pddiktiService;

    public function __construct($applicantDataId)
    {
        $this->applicantDataId = $applicantDataId;
        $this->pddiktiService = new PDDIKTIService();
    }

    public function handle()
    {
        $jobId = $this->job->getJobId() ?? uniqid('screening_', true);

        try {
            Log::info("Starting screening process for applicant ID: {$this->applicantDataId}");

            // Update job status to running
            JobStatus::updateStatus(
                $jobId,
                JobStatus::TYPE_SCREENING,
                JobStatus::STATUS_RUNNING,
                0,
                "Starting screening process for applicant ID: {$this->applicantDataId}",
                ['applicant_id' => $this->applicantDataId]
            );

            // Get the applicant data
            $applicant = ApplicantData::find($this->applicantDataId);
            if (!$applicant) {
                Log::error("Applicant data not found: {$this->applicantDataId}");

                // Update job status to failed
                JobStatus::updateStatus(
                    $jobId,
                    JobStatus::TYPE_SCREENING,
                    JobStatus::STATUS_FAILED,
                    null,
                    "Applicant data not found: {$this->applicantDataId}",
                    ['applicant_id' => $this->applicantDataId]
                );
                return;
            }

            // Update progress
            JobStatus::updateStatus(
                $jobId,
                JobStatus::TYPE_SCREENING,
                JobStatus::STATUS_RUNNING,
                50,
                "Performing screening checks for applicant: {$applicant->nama_lengkap}",
                ['applicant_id' => $this->applicantDataId, 'applicant_name' => $applicant->nama_lengkap]
            );

            // Perform screening checks
            $screeningResult = $this->performScreening($applicant);

            // Update progress
            JobStatus::updateStatus(
                $jobId,
                JobStatus::TYPE_SCREENING,
                JobStatus::STATUS_RUNNING,
                90,
                "Updating applicant data with screening results",
                ['applicant_id' => $this->applicantDataId, 'screening_result' => $screeningResult]
            );

            // Update applicant data with screening results
            $applicant->update([
                'screening_status' => $screeningResult['status'],
                'screening_remark' => $screeningResult['remark']
            ]);

            // Mark job as completed
            JobStatus::updateStatus(
                $jobId,
                JobStatus::TYPE_SCREENING,
                JobStatus::STATUS_COMPLETED,
                100,
                "Screening completed successfully. Status: {$screeningResult['status']}",
                [
                    'applicant_id' => $this->applicantDataId,
                    'applicant_name' => $applicant->nama_lengkap,
                    'screening_result' => $screeningResult
                ]
            );

            Log::info("Screening completed for applicant ID: {$this->applicantDataId}, Status: {$screeningResult['status']}");
        } catch (\Exception $e) {
            Log::error("Error during screening process for applicant ID {$this->applicantDataId}: {$e->getMessage()}");
            Log::error($e->getTraceAsString());

            // Update job status to failed
            JobStatus::updateStatus(
                $jobId,
                JobStatus::TYPE_SCREENING,
                JobStatus::STATUS_FAILED,
                null,
                "Screening process failed: {$e->getMessage()}",
                [
                    'applicant_id' => $this->applicantDataId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]
            );

            // Update applicant data to indicate screening error
            $applicant = ApplicantData::find($this->applicantDataId);
            if ($applicant) {
                $applicant->update([
                    'screening_status' => 2, // 2: stop
                    'screening_remark' => 'Screening process failed: ' . $e->getMessage()
                ]);
            }
        }
    }

    /**
     * Perform the actual screening logic
     */
    private function performScreening($applicant)
    {
        $checks = [];
        $remarks = [];

        // Age check based on tanggal_lahir
        $ageCheck = $this->checkAge($applicant);
        $checks['age'] = $ageCheck['passed'];
        if (!$ageCheck['passed']) {
            $remarks[] = $ageCheck['reason'];
        }

        // Physical attributes check
        $physicalCheck = $this->checkPhysicalAttributes($applicant);
        $checks['physical'] = $physicalCheck['passed'];
        if (!$physicalCheck['passed']) {
            $remarks[] = $physicalCheck['reason'];
        }

        // Program-specific checks
        $programCheck = $this->checkProgramRequirements($applicant);
        $checks['program'] = $programCheck['passed'];
        if (!$programCheck['passed']) {
            $remarks[] = $programCheck['reason'];
        }

        // Education checks
        $educationCheck = $this->checkEducationRequirements($applicant);
        $checks['education'] = $educationCheck['passed'];
        if (!$educationCheck['passed']) {
            $remarks[] = $educationCheck['reason'];
        }

        // Check university and certificate
        $universityCheck = $this->checkUniversityAndCertificate($applicant);
        Log::info("University check: " . json_encode($universityCheck));
        $checks['university'] = $universityCheck['passed'];
        if (!$universityCheck['passed']) {
            $remarks[] = $universityCheck['reason'];
        }

        // Marital status check
        $maritalCheck = $this->checkMaritalStatus($applicant);
        $checks['marital'] = $maritalCheck['passed'];
        if (!$maritalCheck['passed']) {
            $remarks[] = $maritalCheck['reason'];
        }

        // Continue education check
        $continueEducationCheck = $this->checkContinueEducation($applicant);
        $checks['continue_education'] = $continueEducationCheck['passed'];
        if (!$continueEducationCheck['passed']) {
            $remarks[] = $continueEducationCheck['reason'];
        }

        // Determine overall status
        $allPassed = !in_array(false, $checks);
        $status = $allPassed ? 3 : 2; // 3: not yet (screening ai), 2: stop
        $remark = $allPassed ? 'Auto screening passed' : implode('; ', $remarks);

        return [
            'status' => $status,
            'remark' => $remark,
            'checks' => $checks
        ];
    }

    /**
     * Check age requirements
     */
    private function checkAge($applicant)
    {
        $birthDate = Carbon::parse($applicant->tanggal_lahir);
        $age = $birthDate->age;

        // Basic age range check (18-30 years old)
        if ($age < 18 || $age > 30) {
            return [
                'passed' => false,
                'reason' => "Age {$age} is outside acceptable range (18-30 years)"
            ];
        }

        return ['passed' => true, 'reason' => null];
    }

    /**
     * Check physical attributes
     */
    private function checkPhysicalAttributes($applicant)
    {
        $height = $applicant->tinggi_badan;
        $weight = $applicant->berat_badan;

        // Basic height check (minimum 150cm)
        if ($height < 150) {
            return [
                'passed' => false,
                'reason' => "Height {$height}cm is below minimum requirement (150cm)"
            ];
        }

        // Basic weight check (40-100kg)
        if ($weight < 40 || $weight > 100) {
            return [
                'passed' => false,
                'reason' => "Weight {$weight}kg is outside acceptable range (40-100kg)"
            ];
        }

        return ['passed' => true, 'reason' => null];
    }

    /**
     * Check program-specific requirements
     */
    private function checkProgramRequirements($applicant)
    {
        $program = $applicant->program_terpilih;
        $educationLevel = $applicant->jenjang_pendidikan;

        // Add specific program requirements here
        switch ($program) {
            case 'pkpp-estate':
                if (!in_array($educationLevel, ['D3', 'D4', 'S1', 'S2'])) {
                    return [
                        'passed' => false,
                        'reason' => "Education level must be D3, D4, S1, or S2 for Estate program"
                    ];
                }
                // Estate-specific requirements
                break;
            case 'pkpp-ktu':
                if (!in_array($educationLevel, ['D3', 'D4', 'S1', 'S2'])) {
                    return [
                        'passed' => false,
                        'reason' => "Education level must be D3, D4, S1, or S2 for KTU program"
                    ];
                }
                // KTU-specific requirements
                break;
            case 'pkpp-mill':
                if (!in_array($educationLevel, ['S1', 'S2'])) {
                    return [
                        'passed' => false,
                        'reason' => "Education level must be S1 or S2 for Mill program"
                    ];
                }
                // Mill-specific requirements
                break;
            default:
                return [
                    'passed' => false,
                    'reason' => "Invalid program selected: {$program}"
                ];
        }

        return ['passed' => true, 'reason' => null];
    }

    /**
     * Check education requirements
     */
    private function checkEducationRequirements($applicant)
    {
        $educationLevel = $applicant->jenjang_pendidikan;
        $diplomaStatus = $applicant->status_ijazah;

        // Check education level
        $validLevels = ['D3', 'D4', 'S1', 'S2'];
        if (!in_array($educationLevel, $validLevels)) {
            return [
                'passed' => false,
                'reason' => "Invalid education level: {$educationLevel}"
            ];
        }

        // Check diploma status
        if (empty($diplomaStatus)) {
            return [
                'passed' => false,
                'reason' => "Diploma status is required"
            ];
        }

        return ['passed' => true, 'reason' => null];
    }

    /**
     * Check university and certificate
     */
    private function checkUniversityAndCertificate($applicant)
    {
        $name = $applicant->nama_lengkap;
        $university = $applicant->instansi_pendidikan;
        $major = $applicant->jurusan_pendidikan;

        $certificate = $applicant->status_ijazah;

        // Check university and certificate
        if (empty($university) || empty($certificate) || empty($name) || empty($major)) {
            return [
                'passed' => false,
                'reason' => "University, certificate, name, and major are required"
            ];
        }

        if (strtoupper($certificate) == 'TIDAK ADA') {
            return [
                'passed' => false,
                'reason' => "Certificate is required"
            ];
        }

        try {
            // check status graduation using pddikti service
            $result = $this->pddiktiService->checkStatusKelulusan([
                'nama' => $name,
                'program_studi' => $major,
                'universitas' => $university
            ]);

            // Check if the result indicates an error
            if (isset($result['error']) || (isset($result['success']) && !$result['success'])) {
                $errorMessage = $result['error'] ?? $result['message'] ?? 'Unknown PDDIKTI service error';
                Log::error("PDDIKTI service error for applicant {$this->applicantDataId}: {$errorMessage}");
                throw new \Exception("PDDIKTI service error: {$errorMessage}");
            }

            // check the result.results[0]
            if (count($result['results']) == 0) {
                return [
                    'passed' => false,
                    'reason' => "University and certificate are not found"
                ];
            }

            // validate name with result.results[i].nama, major with program_studi, university with universitas
            $foundedStudent = null;
            foreach ($result['results'] as $resultStudent) {
                if (
                    strtoupper($resultStudent['nama']) == strtoupper($name)
                    && strtoupper($resultStudent['program_studi']) == strtoupper($major)
                    && strtoupper($resultStudent['universitas']) == strtoupper($university)
                ) {
                    $foundedStudent = $resultStudent;
                    break;
                }
            }

            if (is_null($foundedStudent)) {
                return [
                    'passed' => false,
                    'reason' => "University and certificate are not valid"
                ];
            }

            Log::info("Founded student: " . json_encode($foundedStudent));

            // check status shoud be GRADUATED
            if ($foundedStudent['ijazah_verification']['status'] != 'GRADUATED') {
                return [
                    'passed' => false,
                    'reason' => "Status kelulusan harus LULUS"
                ];
            }

            return ['passed' => true, 'reason' => null];
        } catch (\Exception $e) {
            // Log the PDDIKTI service error
            Log::error("PDDIKTI service error during university check for applicant {$this->applicantDataId}: {$e->getMessage()}");

            // Re-throw the exception to make the job fail
            throw new \Exception("PDDIKTI service error during university verification: {$e->getMessage()}");
        }
    }

    /**
     * Check marital status requirements
     */
    private function checkMaritalStatus($applicant)
    {
        $maritalStatus = $applicant->status_perkawinan;

        // Basic marital status check
        $validStatuses = ['Lajang'];
        if (!in_array($maritalStatus, $validStatuses)) {
            return [
                'passed' => false,
                'reason' => "Invalid marital status: {$maritalStatus}"
            ];
        }

        return ['passed' => true, 'reason' => null];
    }

    /**
     * Check continue education requirements
     */
    private function checkContinueEducation($applicant)
    {
        $continueEducation = $applicant->melanjutkan_pendidikan;

        // Basic continue education check
        $validOptions = ['Tidak'];
        if (!in_array($continueEducation, $validOptions)) {
            return [
                'passed' => false,
                'reason' => "Invalid continue education option: {$continueEducation}"
            ];
        }

        return ['passed' => true, 'reason' => null];
    }

    public function failed(\Throwable $exception)
    {
        $jobId = $this->job->getJobId() ?? uniqid('screening_', true);

        Log::error("Applicant screening job failed for ID {$this->applicantDataId}: {$exception->getMessage()}");

        // Update job status to failed
        JobStatus::updateStatus(
            $jobId,
            JobStatus::TYPE_SCREENING,
            JobStatus::STATUS_FAILED,
            null,
            "Screening job failed: {$exception->getMessage()}",
            [
                'applicant_id' => $this->applicantDataId,
                'error' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString()
            ]
        );

        // Update applicant data to indicate screening error
        $applicant = ApplicantData::find($this->applicantDataId);
        if ($applicant) {
            $applicant->update([
                'screening_status' => 2, // 2: stop
                'screening_remark' => 'Screening job failed: ' . $exception->getMessage()
            ]);
        }
    }
}
