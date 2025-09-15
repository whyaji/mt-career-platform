<?php

namespace App\Http\Controllers;

use App\Models\ApplicantData;
use App\Services\SecurityService;
use App\Services\TurnstileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class FormController extends Controller
{
    protected $securityService;
    protected $turnstileService;

    public function __construct(SecurityService $securityService, TurnstileService $turnstileService)
    {
        $this->securityService = $securityService;
        $this->turnstileService = $turnstileService;
    }

    // how to get request body in lumen
    public function submit(Request $request)
    {
        try {
            // Validate request data
            $validator = Validator::make($request->json()->all(), [
                'nama_lengkap' => 'required|string|min:1',
                'jenis_kelamin' => 'required|string|in:L,P',
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
                    'message' => 'Security verification failed'
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
            ];

            foreach ($textFields as $field) {
                if ($this->securityService->containsSuspiciousPatterns($field)) {
                    Log::warning("Suspicious input detected from IP: {$clientIP}");
                    return response()->json([
                        'success' => false,
                        'error' => 'INVALID_INPUT',
                        'message' => 'Invalid input detected'
                    ], 400);
                }
            }

            // Check for duplicate submissions
            $existingSubmission = ApplicantData::where('nik', $data['nik'])
                ->where('batch_id', $data['batch_id'])
                ->first();

            if ($existingSubmission) {
                Log::warning("Duplicate submission attempt from IP: {$clientIP}");
                return response()->json([
                    'success' => false,
                    'error' => 'DUPLICATE_SUBMISSION',
                    'message' => 'Duplicate submission detected'
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
                'batch_id' => $data['batch_id'],
            ];

            // Create applicant data
            ApplicantData::create($applicantData);

            Log::info("Form submitted successfully by: {$applicantData['nama_lengkap']}");

            return response()->json([
                'success' => true,
                'message' => 'Form submitted successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error("Error handling form submission: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Internal server error'
            ], 500);
        }
    }
}
