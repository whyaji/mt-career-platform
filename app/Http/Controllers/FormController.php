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
                'message' => 'Internal server error',
                'error_message' => $e->getMessage()
            ], 500);
        }
    }
}
