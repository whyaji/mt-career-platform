<?php

namespace App\Jobs;

use App\Models\ApplicantData;
use App\Models\ApplicantDataGraduationStatus;
use App\Models\ApplicantDataReviewStatus;
use App\Models\ApplicantDataScreeningStatus;
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

        // Assign to processing queue (background screening operations)
        $this->onQueue('processing');
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

            // Get the applicant data with batch
            $applicant = ApplicantData::with('batch')->find($this->applicantDataId);
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

            // Update applicant data to indicate screening in queue
            $applicant->update([
                'screening_status' => ApplicantDataScreeningStatus::IN_QUEUE->value,
                'screening_remark' => 'Screening in queue',
            ]);

            // Get batch configuration
            $batchConfig = $applicant->batch->screening_config ?? [];
            Log::info("Using batch screening configuration", ['batch_id' => $applicant->batch_id, 'config' => $batchConfig]);

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
            $screeningResult = $this->performScreening($applicant, $batchConfig);

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
                'screening_remark' => $screeningResult['remark'],
                'graduation_status' => $screeningResult['graduation_status'],
                'graduation_remark' => $screeningResult['graduation_remark'],
                'review_status' =>
                $screeningResult['status'] == ApplicantDataScreeningStatus::DONE->value ? ApplicantDataReviewStatus::UNREVIEWED->value : ApplicantDataReviewStatus::STOP->value,
                'review_remark' =>
                $screeningResult['status'] == ApplicantDataScreeningStatus::DONE->value ? 'Need review by Admin' : 'Applicant not passed the screening process',
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
                    'screening_status' => ApplicantDataScreeningStatus::PENDING->value,
                    'screening_remark' => 'Screening process failed: ' . $e->getMessage()
                ]);
            }
        }
    }

    /**
     * Perform the actual screening logic
     */
    private function performScreening($applicant, $config = [])
    {
        $checks = [];
        $remarks = [];

        // Age check based on tanggal_lahir (if enabled in config)
        if (!isset($config['age']['enabled']) || $config['age']['enabled']) {
            $ageCheck = $this->checkAge($applicant, $config['age'] ?? []);
            $checks['age'] = $ageCheck['passed'];
            if (!$ageCheck['passed']) {
                $remarks[] = $ageCheck['reason'];
            }
        }

        // Physical attributes check (if enabled in config)
        if (!isset($config['physical']['enabled']) || $config['physical']['enabled']) {
            $physicalCheck = $this->checkPhysicalAttributes($applicant, $config['physical'] ?? []);
            $checks['physical'] = $physicalCheck['passed'];
            if (!$physicalCheck['passed']) {
                $remarks[] = $physicalCheck['reason'];
            }
        }

        // Program-specific checks (if enabled in config)
        if (!isset($config['program']['enabled']) || $config['program']['enabled']) {
            $programCheck = $this->checkProgramRequirements($applicant, $config['program'] ?? []);
            $checks['program'] = $programCheck['passed'];
            if (!$programCheck['passed']) {
                $remarks[] = $programCheck['reason'];
            }
        }

        // Education checks (if enabled in config)
        if (!isset($config['education']['enabled']) || $config['education']['enabled']) {
            $educationCheck = $this->checkEducationRequirements($applicant, $config['education'] ?? []);
            $checks['education'] = $educationCheck['passed'];
            if (!$educationCheck['passed']) {
                $remarks[] = $educationCheck['reason'];
            }
        }

        // Marital status check (if enabled in config)
        if (!isset($config['marital']['enabled']) || $config['marital']['enabled']) {
            $maritalCheck = $this->checkMaritalStatus($applicant, $config['marital'] ?? []);
            $checks['marital'] = $maritalCheck['passed'];
            if (!$maritalCheck['passed']) {
                $remarks[] = $maritalCheck['reason'];
            }
        }

        // Continue education check (if enabled in config)
        if (!isset($config['continue_education']['enabled']) || $config['continue_education']['enabled']) {
            $continueEducationCheck = $this->checkContinueEducation($applicant, $config['continue_education'] ?? []);
            $checks['continue_education'] = $continueEducationCheck['passed'];
            if (!$continueEducationCheck['passed']) {
                $remarks[] = $continueEducationCheck['reason'];
            }
        }

        // Determine overall status
        $allPassed = !in_array(false, $checks);
        $status = $allPassed ? ApplicantDataScreeningStatus::DONE->value : ApplicantDataScreeningStatus::STOP->value; // 5: done (screening ai), 2: stop

        $remark = $allPassed ? 'Auto screening passed' : implode('; ', $remarks);

        $graduationRemark = null;
        // Check university and certificate (if enabled in config)
        $universityCheck = ['status' => ApplicantDataGraduationStatus::PENDING->value, 'reason' => 'Not checked'];
        if (!isset($config['university']['enabled']) || $config['university']['enabled']) {
            $universityCheck = $this->checkUniversityAndCertificate($applicant, $config['university'] ?? []);
        }

        $graduationStatus = $universityCheck['status'];
        $graduationRemark = $universityCheck['reason'];

        return [
            'status' => $status,
            'remark' => $remark,
            'checks' => $checks,
            'graduation_status' => $graduationStatus,
            'graduation_remark' => $graduationRemark,
        ];
    }

    /**
     * Check age requirements
     */
    private function checkAge($applicant, $config = [])
    {
        $birthDate = Carbon::parse($applicant->tanggal_lahir);
        $age = $birthDate->age;

        // Get age range from config or use defaults
        $minAge = $config['min_age'] ?? 18;
        $maxAge = $config['max_age'] ?? 30;

        // Age range check
        if ($age < $minAge || $age > $maxAge) {
            return [
                'passed' => false,
                'reason' => "Age {$age} is outside acceptable range ({$minAge}-{$maxAge} years)"
            ];
        }

        return ['passed' => true, 'reason' => null];
    }

    /**
     * Check physical attributes
     */
    private function checkPhysicalAttributes($applicant, $config = [])
    {
        $height = $applicant->tinggi_badan;
        $weight = $applicant->berat_badan;

        // Get height from config or use defaults
        $minHeight = $config['min_height'] ?? 150;

        // Height check
        if ($height < $minHeight) {
            return [
                'passed' => false,
                'reason' => "Height {$height}cm is below minimum requirement ({$minHeight}cm)"
            ];
        }

        // Get weight range from config or use defaults
        $minWeight = $config['min_weight'] ?? 40;
        $maxWeight = $config['max_weight'] ?? 100;

        // Weight check
        if ($weight < $minWeight || $weight > $maxWeight) {
            return [
                'passed' => false,
                'reason' => "Weight {$weight}kg is outside acceptable range ({$minWeight}-{$maxWeight}kg)"
            ];
        }

        return ['passed' => true, 'reason' => null];
    }

    /**
     * Check program-specific requirements
     */
    private function checkProgramRequirements($applicant, $config = [])
    {
        $program = $applicant->program_terpilih;
        $educationLevel = $applicant->jenjang_pendidikan;

        // Get allowed education levels from config
        $allowedLevels = $config['allowed_education_levels'] ?? [];

        // If config has specific requirements, use them
        if (!empty($allowedLevels)) {
            if (!in_array($educationLevel, $allowedLevels)) {
                return [
                    'passed' => false,
                    'reason' => "Education level {$educationLevel} is not allowed. Required: " . implode(', ', $allowedLevels)
                ];
            }
            return ['passed' => true, 'reason' => null];
        }

        // Otherwise, use default program requirements
        switch ($program) {
            case 'pkpp-estate':
                if (!in_array($educationLevel, ['D3', 'D4', 'S1', 'S2'])) {
                    return [
                        'passed' => false,
                        'reason' => "Education level must be D3, D4, S1, or S2 for Estate program"
                    ];
                }
                break;
            case 'pkpp-ktu':
                if (!in_array($educationLevel, ['D3', 'D4', 'S1', 'S2'])) {
                    return [
                        'passed' => false,
                        'reason' => "Education level must be D3, D4, S1, or S2 for KTU program"
                    ];
                }
                break;
            case 'pkpp-mill':
                if (!in_array($educationLevel, ['S1', 'S2'])) {
                    return [
                        'passed' => false,
                        'reason' => "Education level must be S1 or S2 for Mill program"
                    ];
                }
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
    private function checkEducationRequirements($applicant, $config = [])
    {
        $educationLevel = $applicant->jenjang_pendidikan;
        $diplomaStatus = $applicant->status_ijazah;

        // Get valid education levels from config or use defaults
        $validLevels = $config['valid_levels'] ?? ['D3', 'D4', 'S1', 'S2'];

        // Check education level
        if (!in_array($educationLevel, $validLevels)) {
            return [
                'passed' => false,
                'reason' => "Invalid education level: {$educationLevel}. Allowed: " . implode(', ', $validLevels)
            ];
        }

        // Check diploma status if required
        $requireDiploma = $config['require_diploma'] ?? true;
        if ($requireDiploma && empty($diplomaStatus)) {
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
    private function checkUniversityAndCertificate($applicant, $config = [])
    {
        $name = $applicant->nama_lengkap;
        $university = $applicant->instansi_pendidikan;
        $major = $applicant->jurusan_pendidikan;
        $certificate = $applicant->status_ijazah;

        // Check university and certificate
        if (empty($university) || empty($name) || empty($major)) {
            return [
                'status' => ApplicantDataGraduationStatus::NOT_FOUND->value,
                'reason' => "University, name, and major are required"
            ];
        }

        if (strtoupper($certificate) == 'TIDAK ADA' || empty($certificate)) {
            return [
                'status' => ApplicantDataGraduationStatus::NOT_FOUND->value,
                'reason' => "Certificate is required"
            ];
        }

        try {
            // Check status graduation using PDDIKTI service
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

            // Check if no results found
            if (empty($result['results']) || count($result['results']) == 0) {
                // Check status graduation using PDDIKTI service without program studi and universitas
                $result = $this->pddiktiService->checkStatusKelulusan([
                    'nama' => $name,
                ]);

                // Check if the result indicates an error
                if (isset($result['error']) || (isset($result['success']) && !$result['success'])) {
                    $errorMessage = $result['error'] ?? $result['message'] ?? 'Unknown PDDIKTI service error';
                    Log::error("PDDIKTI service error for applicant {$this->applicantDataId}: {$errorMessage}");
                    throw new \Exception("PDDIKTI service error: {$errorMessage}");
                }

                if (empty($result['results']) || count($result['results']) == 0) {
                    return [
                        'status' => ApplicantDataGraduationStatus::NOT_FOUND->value,
                        'reason' => "Student data not found in PDDIKTI database"
                    ];
                }
            }

            // Find the best matching student from results
            $bestMatch = null;
            $majorMatch = false;
            $universityMatch = false;

            foreach ($result['results'] as $student) {
                $verification = $student['ijazah_verification'] ?? null;

                if (!$verification) {
                    continue;
                }

                // Check if name and university match
                $nameMatch = strtoupper($student['nama'] ?? '') == strtoupper($name);
                $currentUniversityMatch = stripos($student['universitas'] ?? '', $university) !== false ||
                    stripos($university, $student['universitas'] ?? '') !== false;

                if ($nameMatch) {
                    // Check if major matches
                    $currentMajorMatch = stripos($student['program_studi'] ?? '', $major) !== false ||
                        stripos($major, $student['program_studi'] ?? '') !== false;

                    // Prioritize graduated students
                    if ($verification['status'] === 'GRADUATED') {
                        if ($currentUniversityMatch && $currentMajorMatch) {
                            // Perfect match: graduated, university and major match
                            $bestMatch = $student;
                            $universityMatch = true;
                            $majorMatch = true;
                            break;
                        } elseif ($currentUniversityMatch && !$currentMajorMatch) {
                            // Good match: graduated, university matches but major doesn't
                            if (!$bestMatch || !$universityMatch) {
                                $bestMatch = $student;
                                $universityMatch = true;
                                $majorMatch = false;
                            }
                        } elseif (!$currentUniversityMatch && !$currentMajorMatch) {
                            // University and major mismatch but graduated and name matches
                            if (!$bestMatch) {
                                $bestMatch = $student;
                                $universityMatch = false;
                                $majorMatch = false;
                            }
                        } elseif (!$currentMajorMatch) {
                            // Major mismatch but graduated and name matches
                            if (!$bestMatch) {
                                $bestMatch = $student;
                                $universityMatch = $currentUniversityMatch;
                                $majorMatch = false;
                            }
                        } elseif (!$currentUniversityMatch) {
                            // University mismatch but graduated and name matches
                            if (!$bestMatch) {
                                $bestMatch = $student;
                                $universityMatch = false;
                                $majorMatch = $currentMajorMatch;
                            }
                        }
                    } elseif ($currentUniversityMatch && !$bestMatch) {
                        // Fallback: not graduated but name and university match
                        $bestMatch = $student;
                        $universityMatch = true;
                        $majorMatch = $currentMajorMatch;
                    } elseif (!$currentUniversityMatch && !$currentMajorMatch && !$bestMatch) {
                        // University and major mismatch but graduated and name matches
                        $bestMatch = $student;
                        $universityMatch = false;
                        $majorMatch = false;
                    }
                }
            }

            // If no match found
            if (!$bestMatch) {
                return [
                    'status' => ApplicantDataGraduationStatus::NOT_FOUND->value,
                    'reason' => "No matching student found with name '{$name}' and university '{$university}'"
                ];
            }

            // Map PDDIKTI verification status to ApplicantDataGraduationStatus
            $verification = $bestMatch['ijazah_verification'];
            $verificationStatus = $verification['status'] ?? 'UNKNOWN';

            switch ($verificationStatus) {
                case 'GRADUATED':
                    if ($universityMatch && $majorMatch) {
                        $status = ApplicantDataGraduationStatus::GRADUATED->value;
                        $reason = "Student graduated from {$bestMatch['program_studi']} at {$bestMatch['universitas']}";
                    } elseif (!$universityMatch && !$majorMatch) {
                        $status = ApplicantDataGraduationStatus::NOT_MATCH->value;
                        $reason = "Student graduated but university and major does not match. Found: '{$bestMatch['program_studi']}' at {$bestMatch['universitas']}, Expected: '{$major}' at {$university}";
                    } elseif (!$universityMatch) {
                        $status = ApplicantDataGraduationStatus::NOT_MATCH->value;
                        $reason = "Student university not match. Found: '{$bestMatch['universitas']}', Expected: '{$university}'";
                    } elseif (!$majorMatch) {
                        $status = ApplicantDataGraduationStatus::NOT_MATCH->value;
                        $reason = "Student graduated but major does not match. Found: '{$bestMatch['program_studi']}', Expected: '{$major}'";
                    }
                    break;

                case 'ACTIVE':
                case 'NON_ACTIVE':
                case 'NOT_GRADUATED':
                    $status = ApplicantDataGraduationStatus::NOT_GRADUATED->value;
                    $currentStatus = $bestMatch['status_saat_ini'] ?? 'Unknown';
                    $reason = "Student is not yet graduated. Status: {$currentStatus}";
                    break;

                case 'DROPOUT':
                    $status = ApplicantDataGraduationStatus::DROPOUT->value;
                    $currentStatus = $bestMatch['status_saat_ini'] ?? 'Unknown';
                    $reason = "Student has dropped out or is inactive. Status: {$currentStatus}";
                    break;

                default:
                    $status = ApplicantDataGraduationStatus::NOT_MATCH->value;
                    $currentStatus = $bestMatch['status_saat_ini'] ?? 'Unknown';
                    $reason = "Unknown graduation status: {$verificationStatus}. Status: {$currentStatus}";
                    break;
            }

            Log::info("Graduation check for applicant {$this->applicantDataId}: Status={$status}, Reason={$reason}");

            return [
                'status' => $status,
                'reason' => $reason
            ];
        } catch (\Exception $e) {
            // Log the PDDIKTI service error
            Log::error("PDDIKTI service error during university check for applicant {$this->applicantDataId}: {$e->getMessage()}");

            return [
                'status' => ApplicantDataGraduationStatus::ERROR->value,
                'reason' => "PDDIKTI service error: {$e->getMessage()}"
            ];
        }
    }

    /**
     * Check marital status requirements
     */
    private function checkMaritalStatus($applicant, $config = [])
    {
        $maritalStatus = $applicant->status_perkawinan;

        // Get valid marital statuses from config or use defaults
        $validStatuses = $config['valid_statuses'] ?? ['Lajang'];

        // Marital status check
        if (!in_array($maritalStatus, $validStatuses)) {
            return [
                'passed' => false,
                'reason' => "Invalid marital status: {$maritalStatus}. Allowed: " . implode(', ', $validStatuses)
            ];
        }

        return ['passed' => true, 'reason' => null];
    }

    /**
     * Check continue education requirements
     */
    private function checkContinueEducation($applicant, $config = [])
    {
        $continueEducation = $applicant->melanjutkan_pendidikan;

        // Get valid continue education options from config or use defaults
        $validOptions = $config['valid_options'] ?? ['Tidak'];

        // Continue education check
        if (!in_array($continueEducation, $validOptions)) {
            return [
                'passed' => false,
                'reason' => "Invalid continue education option: {$continueEducation}. Allowed: " . implode(', ', $validOptions)
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
                'screening_status' => ApplicantDataScreeningStatus::STOP->value, // 2: stop
                'screening_remark' => 'Screening job failed: ' . $exception->getMessage()
            ]);
        }
    }
}
