<?php

namespace App\Http\Controllers;

use App\Models\ApplicantData;
use App\Models\ScreeningApplicant;
use App\Services\SecurityService;
use App\Services\TurnstileService;
use App\Services\DynamicFormValidationService;
use App\Services\ScoringService;
use App\Jobs\ApplicantScreeningJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class FormController extends Controller
{
    protected $securityService;
    protected $turnstileService;
    protected $validationService;
    protected $scoringService;

    public function __construct(
        SecurityService $securityService,
        TurnstileService $turnstileService,
        DynamicFormValidationService $validationService,
        ScoringService $scoringService
    ) {
        $this->securityService = $securityService;
        $this->turnstileService = $turnstileService;
        $this->validationService = $validationService;
        $this->scoringService = $scoringService;
    }

    // how to get request body in lumen
    public function submit(Request $request)
    {
        try {
            // Validate request data
            $validator = Validator::make($request->json()->all(), [
                'nama_lengkap' => 'required|string|min:1',
                'jenis_kelamin' => ['required', 'string', Rule::in(['L', 'P'])],
                'tempat_lahir' => 'required|string|min:1',
                'tanggal_lahir' => 'required|date',
                'usia' => 'required|integer|min:0',
                'daerah_lahir' => 'required|string|min:1',
                'provinsi_lahir' => 'required|string|min:1',
                'tinggi_badan' => 'required|integer|min:0',
                'berat_badan' => 'required|integer|min:0',
                'nik' => 'required|string|size:16',
                'daerah_domisili' => 'required|string|min:1',
                'provinsi_domisili' => 'required|string|min:1',
                'kota_domisili' => 'required|string|min:1',
                'alamat_domisili' => 'required|string|min:1',
                'program_terpilih' => ['required', 'string', Rule::in(['pkpp-estate', 'pkpp-ktu', 'pkpp-mill'])],
                'jurusan_pendidikan' => 'required|string|min:1',
                'jenjang_pendidikan' => ['required', 'string', Rule::in(['D3', 'D4', 'S1', 'S2'])],
                'instansi_pendidikan' => 'required|string|min:1',
                'status_ijazah' => 'required|string|min:1',
                'nomor_whatsapp' => 'required|string|min:1',
                'email' => 'required|email',
                'status_perkawinan' => ['required', 'string', Rule::in(['Lajang', 'Kawin', 'Cerai'])],
                'melanjutkan_pendidikan' => ['required', 'string', Rule::in(['Ya', 'Tidak'])],
                'ukuran_baju' => ['required', 'string', Rule::in(['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'])],
                'riwayat_penyakit' => 'required|string|min:1',
                'nim' => 'nullable|string|min:1',
                'batch_id' => 'required|uuid|exists:batch,id',
                'agreement1' => 'required|string|min:1',
                'agreement2' => 'required|string|min:1',
                'agreement3' => 'required|string|min:1',
                'turnstileToken' => 'required|string|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }


            $data = $validator->validated();

            // Get client IP
            $clientIP = $request->header('x-forwarded-for')
                ?? $request->header('x-real-ip')
                ?? $request->ip()
                ?? 'unknown';

            // Verify Turnstile token
            $turnstileValid = $this->turnstileService->verify($data['turnstileToken'], $clientIP);

            if (!$turnstileValid) {
                Log::warning("Turnstile verification failed from IP: {$clientIP}");
                return response()->json([
                    'success' => false,
                    'error' => 'TURNSTILE_FAILED',
                    'message' => 'Verifikasi keamanan gagal'
                ], 400);
            }

            // Security checks
            $textFields = [
                $data['nama_lengkap'],
                $data['alamat_domisili'],
                $data['kota_domisili'],
                $data['daerah_domisili'],
                $data['provinsi_domisili'],
                $data['tempat_lahir'],
                $data['daerah_lahir'],
                $data['provinsi_lahir'],
                $data['program_terpilih'],
                $data['jurusan_pendidikan'],
                $data['jenjang_pendidikan'],
                $data['instansi_pendidikan'],
                $data['status_ijazah'],
                $data['nomor_whatsapp'],
                $data['email'],
                $data['status_perkawinan'],
                $data['melanjutkan_pendidikan'],
                $data['ukuran_baju'],
                $data['riwayat_penyakit'],
            ];

            if ($data['nim']) {
                $textFields[] = $data['nim'];
            }

            foreach ($textFields as $field) {
                if ($this->securityService->containsSuspiciousPatterns($field)) {
                    Log::warning("Suspicious input detected from IP: {$clientIP}");
                    return response()->json([
                        'success' => false,
                        'error' => 'INVALID_INPUT',
                        'message' => 'Input tidak valid'
                    ], 400);
                }
            }

            // Check for duplicate submissions
            $existingSubmission = ApplicantData::where('nik', $data['nik'])
                ->where('batch_id', $data['batch_id'])
                ->first();

            if ($existingSubmission) {
                Log::warning("Duplicate submission attempt from IP: {$clientIP}, NAME: {$data['nama_lengkap']}, NIK: {$data['nik']}, Batch ID: {$data['batch_id']}");
                return response()->json([
                    'success' => false,
                    'error' => 'DUPLICATE_SUBMISSION',
                    'message' => 'Data anda sudah terdaftar untuk batch ini'
                ], 409);
            }

            // Sanitize and prepare data
            $applicantData = [
                'nama_lengkap' => $this->securityService->sanitizeText(strtoupper($data['nama_lengkap'])),
                'jenis_kelamin' => $data['jenis_kelamin'],
                'tempat_lahir' => $this->securityService->sanitizeText(strtoupper($data['tempat_lahir'])),
                'tanggal_lahir' => $data['tanggal_lahir'],
                'usia' => $data['usia'],
                'daerah_lahir' => $this->securityService->sanitizeText(strtoupper($data['daerah_lahir'])),
                'provinsi_lahir' => $this->securityService->sanitizeText(strtoupper($data['provinsi_lahir'])),
                'tinggi_badan' => $data['tinggi_badan'],
                'berat_badan' => $data['berat_badan'],
                'nik' => $data['nik'],
                'daerah_domisili' => $this->securityService->sanitizeText(strtoupper($data['daerah_domisili'])),
                'provinsi_domisili' => $this->securityService->sanitizeText(strtoupper($data['provinsi_domisili'])),
                'kota_domisili' => $this->securityService->sanitizeText(strtoupper($data['kota_domisili'])),
                'alamat_domisili' => $this->securityService->sanitizeText(strtoupper($data['alamat_domisili'])),
                'program_terpilih' => $this->securityService->sanitizeText($data['program_terpilih']),
                'jurusan_pendidikan' => $this->securityService->sanitizeText(strtoupper($data['jurusan_pendidikan'])),
                'jenjang_pendidikan' => $this->securityService->sanitizeText(strtoupper($data['jenjang_pendidikan'])),
                'instansi_pendidikan' => $this->securityService->sanitizeText(strtoupper($data['instansi_pendidikan'])),
                'nim' => $data['nim'] ? $this->securityService->sanitizeText($data['nim']) : null,
                'status_ijazah' => $this->securityService->sanitizeText(strtoupper($data['status_ijazah'])),
                'nomor_whatsapp' => $this->securityService->sanitizeText(strtoupper($data['nomor_whatsapp'])),
                'email' => $this->securityService->sanitizeText(strtolower($data['email'])),
                'status_perkawinan' => $this->securityService->sanitizeText(strtoupper($data['status_perkawinan'])),
                'melanjutkan_pendidikan' => $this->securityService->sanitizeText(strtoupper($data['melanjutkan_pendidikan'])),
                'ukuran_baju' => $this->securityService->sanitizeText(strtoupper($data['ukuran_baju'])),
                'riwayat_penyakit' => $this->securityService->sanitizeText(strtoupper($data['riwayat_penyakit'])),
                'batch_id' => $data['batch_id'],
            ];

            // Create applicant data
            $applicant = ApplicantData::create($applicantData);

            Log::info("Form submitted successfully by: {$applicantData['nama_lengkap']}");

            // Trigger screening job
            dispatch(new ApplicantScreeningJob($applicant->id));

            return response()->json([
                'success' => true,
                'message' => 'Form submitted successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error("Error handling form submission: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Internal server error',
                'error_message' => $e->getMessage()
            ], 500);
        }
    }

    public function formSubmit(Request $request)
    {
        try {
            $data = $request->all();

            // Basic validation for required fields
            $validator = Validator::make($data, [
                'batch_id' => 'required|uuid|exists:batch,id',
                'answers' => 'required|array|min:1',
                'agreement1' => 'required|string|in:agree',
                'agreement2' => 'required|string|in:agree',
                'agreement3' => 'required|string|in:agree',
                'turnstileToken' => 'required|string|min:1',
            ], [
                'agreement1.in' => 'Agreement 1 must be set to "agree"',
                'agreement2.in' => 'Agreement 2 must be set to "agree"',
                'agreement3.in' => 'Agreement 3 must be set to "agree"',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            // Additional validation to ensure agreement values are exactly "agree"
            $agreementFields = ['agreement1', 'agreement2', 'agreement3'];
            foreach ($agreementFields as $field) {
                if ($data[$field] !== 'agree') {
                    return response()->json([
                        'success' => false,
                        'error' => 'VALIDATION_ERROR',
                        'message' => 'All agreements must be set to "agree"',
                        'errors' => [
                            $field => ["The {$field} must be exactly 'agree'"]
                        ]
                    ], 400);
                }
            }

            // Get client IP and User Agent
            $clientIP = $request->header('x-forwarded-for')
                ?? $request->header('x-real-ip')
                ?? $request->ip()
                ?? 'unknown';

            $userAgent = $request->header('user-agent') ?? 'unknown';

            // Verify Turnstile token
            $turnstileValid = $this->turnstileService->verify($data['turnstileToken'], $clientIP);

            if (!$turnstileValid) {
                Log::warning("Turnstile verification failed from IP: {$clientIP}");
                return response()->json([
                    'success' => false,
                    'error' => 'TURNSTILE_FAILED',
                    'message' => 'Verifikasi keamanan gagal'
                ], 400);
            }

            // Validate dynamic form using the validation service
            $validationResult = $this->validationService->validateFormSubmission($data, $data['batch_id']);

            if (!$validationResult['valid']) {
                return response()->json([
                    'success' => false,
                    'error' => 'FORM_VALIDATION_ERROR',
                    'message' => 'Form validation failed',
                    'errors' => $validationResult['errors']
                ], 400);
            }

            // Security checks on all text fields in the payload
            $textFields = [];

            // Extract text values from answers
            foreach ($data['answers'] as $answer) {
                if (is_string($answer['answer'])) {
                    $textFields[] = $answer['answer'];
                } elseif (is_array($answer['answer'])) {
                    // Handle multiselect/checkbox arrays
                    foreach ($answer['answer'] as $value) {
                        if (is_string($value)) {
                            $textFields[] = $value;
                        }
                    }
                }
            }

            // Add agreement fields
            $textFields[] = $data['agreement1'];
            $textFields[] = $data['agreement2'];
            $textFields[] = $data['agreement3'];

            // Apply security checks to all text fields
            foreach ($textFields as $field) {
                if ($this->securityService->containsSuspiciousPatterns($field)) {
                    Log::warning("Suspicious input detected from IP: {$clientIP}");
                    return response()->json([
                        'success' => false,
                        'error' => 'INVALID_INPUT',
                        'message' => 'Input tidak valid'
                    ], 400);
                }
            }

            // Check for duplicate submissions based on NIK if present
            $nikAnswer = collect($data['answers'])->firstWhere('question_code', 'nik');
            if ($nikAnswer && !empty($nikAnswer['answer'])) {
                $existingSubmission = ScreeningApplicant::where('batch_id', $data['batch_id'])
                    ->whereJsonContains('answers', [
                        'question_code' => 'nik',
                        'answer' => $nikAnswer['answer']
                    ])
                    ->first();

                if ($existingSubmission) {
                    Log::warning("Duplicate submission attempt from IP: {$clientIP}, NIK: {$nikAnswer['answer']}, Batch ID: {$data['batch_id']}");
                    return response()->json([
                        'success' => false,
                        'error' => 'DUPLICATE_SUBMISSION',
                        'message' => 'Data anda sudah terdaftar untuk batch ini'
                    ], 409);
                }
            }

            // Sanitize answers data
            $sanitizedAnswers = [];
            foreach ($data['answers'] as $answer) {
                $sanitizedAnswer = $answer;

                // Sanitize string answers
                if (is_string($answer['answer'])) {
                    $sanitizedAnswer['answer'] = $this->securityService->sanitizeText(strtoupper($answer['answer']));
                } elseif (is_array($answer['answer'])) {
                    // Sanitize array answers (multiselect/checkbox)
                    $sanitizedAnswer['answer'] = array_map(function ($value) {
                        return is_string($value) ? $this->securityService->sanitizeText(strtoupper($value)) : $value;
                    }, $answer['answer']);
                }

                $sanitizedAnswers[] = $sanitizedAnswer;
            }

            // Calculate scores
            $scoringResult = $this->scoringService->calculateScores($sanitizedAnswers, $data['batch_id']);

            // Create screening applicant record
            $screeningApplicant = ScreeningApplicant::create([
                'batch_id' => $data['batch_id'],
                'answers' => $sanitizedAnswers,
                'scoring' => $scoringResult['scoring'],
                'total_score' => $scoringResult['total_score'],
                'max_score' => $scoringResult['max_score'],
                'status' => ScreeningApplicant::STATUS_SCORED,
                'ip_address' => $clientIP,
                'user_agent' => $userAgent,
            ]);

            Log::info("Dynamic form submitted successfully. Screening Applicant ID: {$screeningApplicant->id}, Score: {$scoringResult['total_score']}/{$scoringResult['max_score']}, IP: {$clientIP}");

            return response()->json([
                'success' => true,
                'message' => 'Form submitted successfully',
                // 'data' => [
                //     'screening_applicant_id' => $screeningApplicant->id,
                //     'total_score' => $scoringResult['total_score'],
                //     'max_score' => $scoringResult['max_score'],
                //     'scoring_percentage' => $screeningApplicant->getScoringPercentage(),
                // ]
            ], 201);
        } catch (\Exception $e) {
            Log::error("Error handling dynamic form submission: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Internal server error',
                'error_message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get scoring summary for a batch
     */
    public function getScoringSummary(Request $request, string $batchId)
    {
        try {
            $summary = $this->scoringService->getScoringSummary($batchId);

            return response()->json([
                'success' => true,
                'data' => $summary
            ]);
        } catch (\Exception $e) {
            Log::error("Error getting scoring summary: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Internal server error'
            ], 500);
        }
    }
}
