<?php

namespace App\Console\Commands;

use App\Jobs\ApplicantScreeningJob;
use App\Models\ApplicantData;
use App\Models\ApplicantDataScreeningStatus;
use App\Models\ApplicantDataGraduationStatus;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class DailyApplicantScreeningCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'applicants:daily-screening';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run daily screening for pending and error graduation status applicants';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Starting daily applicant screening...');

        try {
            // Filter applicants with:
            // 1. screening_status = PENDING OR
            // 2. graduation_status equal to ApplicantDataGraduationStatus::PENDING->value or (graduation_status equal to ApplicantDataGraduationStatus::ERROR->value and graduation_remark start with 'PDDIKTI service error') and screening_status not equal to ApplicantDataScreeningStatus::IN_QUEUE->value
            $applicants = ApplicantData::where(function ($query) {
                $query->where('screening_status', ApplicantDataScreeningStatus::PENDING->value)
                    ->orWhere(function ($subQuery) {
                        $subQuery->where(function ($graduationQuery) {
                            $graduationQuery->where('graduation_status', ApplicantDataGraduationStatus::PENDING->value)
                                ->orWhere(function ($errorQuery) {
                                    $errorQuery->where('graduation_status', ApplicantDataGraduationStatus::ERROR->value)
                                        ->where('graduation_remark', 'like', 'PDDIKTI service error%');
                                });
                        })
                            ->where('screening_status', '!=', ApplicantDataScreeningStatus::IN_QUEUE->value);
                    });
            })->get();

            $count = $applicants->count();
            $this->info("Found {$count} applicant(s) to process.");

            if ($count === 0) {
                $this->info('No applicants to process. Exiting.');
                return 0;
            }

            $processed = 0;
            $failed = 0;

            foreach ($applicants as $applicant) {
                try {
                    // Update screening status and remark
                    $applicant->update([
                        'screening_status' => ApplicantDataScreeningStatus::PENDING->value,
                        'screening_remark' => 'Auto daily screening',
                    ]);

                    // Dispatch the screening job
                    dispatch(new ApplicantScreeningJob($applicant->id));

                    $processed++;
                    $this->info("Processed applicant ID: {$applicant->id}");
                } catch (\Exception $e) {
                    $failed++;
                    $this->error("Failed to process applicant ID: {$applicant->id}");
                    $this->error("Error: " . $e->getMessage());
                    Log::error("Daily screening failed for applicant {$applicant->id}: " . $e->getMessage());
                }
            }

            $this->info("Daily applicant screening completed!");
            $this->info("Total: {$count} | Processed: {$processed} | Failed: {$failed}");

            Log::info("Daily applicant screening completed. Total: {$count} | Processed: {$processed} | Failed: {$failed}");

            return 0;
        } catch (\Exception $e) {
            $this->error('An error occurred during daily screening: ' . $e->getMessage());
            Log::error('Daily applicant screening error: ' . $e->getMessage());
            return 1;
        }
    }
}
