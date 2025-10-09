<?php

namespace App\Http\Controllers;

use App\Models\ApplicantData;
use App\Models\GeneratedFile;
use App\Jobs\GenerateApplicationsExcelJob;
use App\Models\Batch;
use App\Traits\PaginationTrait;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ApplicantDataController extends Controller
{
    use PaginationTrait;

    public function __construct()
    {
        $this->middleware('jwt.auth');
    }

    public function getApplications(Request $request)
    {
        try {
            // Get pagination parameters
            $paginationParams = $this->getPaginationParams($request);

            // Define searchable fields
            $searchableFields = [
                'nama_lengkap',
                'email',
                'nomor_whatsapp',
                'nik',
                'instansi_pendidikan',
                'program_terpilih',
                'jurusan_pendidikan',
                'tempat_lahir',
                'daerah_lahir',
                'provinsi_lahir',
                'daerah_domisili',
                'provinsi_domisili',
                'kota_domisili',
                'nim',
                'status_ijazah',
                'status_perkawinan',
                'ukuran_baju',
                'riwayat_penyakit'
            ];

            // Build query with batch relationship - return all fields
            $query = ApplicantData::with('batch');

            // Apply pagination with search
            $result = $this->paginateQuery($query, $paginationParams, $searchableFields);

            return $this->paginatedResponse($result, 'Applications retrieved successfully');
        } catch (\Exception $e) {
            Log::error("Error getting all applications: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getApplicationsByBatch(Request $request, $batchId)
    {
        try {
            // Verify batch exists
            $batch = Batch::find($batchId);
            if (!$batch) {
                return response()->json([
                    'success' => false,
                    'error' => 'BATCH_NOT_FOUND'
                ], 404);
            }

            // Get pagination parameters
            $paginationParams = $this->getPaginationParams($request);

            // Define searchable fields
            $searchableFields = [
                'nama_lengkap',
                'email',
                'nomor_whatsapp',
                'nik',
                'instansi_pendidikan',
                'program_terpilih',
                'jurusan_pendidikan',
                'tempat_lahir',
                'daerah_lahir',
                'provinsi_lahir',
                'daerah_domisili',
                'provinsi_domisili',
                'kota_domisili',
                'nim',
                'status_ijazah',
                'status_perkawinan',
                'ukuran_baju',
                'riwayat_penyakit'
            ];

            $query = ApplicantData::where('batch_id', $batchId)->with('batch:id,number,location,year');

            $result = $this->paginateQuery($query, $paginationParams, $searchableFields);

            return $this->paginatedResponse($result, 'Applications retrieved successfully');
        } catch (\Exception $e) {
            Log::error("Error getting applications by batch: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getApplicationById($id)
    {
        try {
            $application = ApplicantData::with('batch')->find($id);

            if (!$application) {
                return response()->json([
                    'success' => false,
                    'error' => 'APPLICATION_NOT_FOUND'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $application
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting application by ID: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function updateApplication(Request $request, $id)
    {
        try {
            $application = ApplicantData::find($id);

            if (!$application) {
                return response()->json([
                    'success' => false,
                    'error' => 'APPLICATION_NOT_FOUND'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'nama_lengkap' => 'sometimes|required|string|max:255',
                'jenis_kelamin' => 'sometimes|required|string|in:L,P',
                'tempat_lahir' => 'sometimes|required|string|max:255',
                'tanggal_lahir' => 'sometimes|required|date',
                'usia' => 'sometimes|required|integer|min:1|max:100',
                'daerah_lahir' => 'sometimes|required|string|max:255',
                'provinsi_lahir' => 'sometimes|required|string|max:255',
                'tinggi_badan' => 'sometimes|required|integer|min:100|max:250',
                'berat_badan' => 'sometimes|required|integer|min:30|max:200',
                'nik' => 'sometimes|required|string|max:16',
                'daerah_domisili' => 'sometimes|required|string|max:255',
                'provinsi_domisili' => 'sometimes|required|string|max:255',
                'kota_domisili' => 'sometimes|required|string|max:255',
                'alamat_domisili' => 'sometimes|required|string|max:500',
                'program_terpilih' => 'sometimes|required|string|max:255',
                'jurusan_pendidikan' => 'sometimes|required|string|max:255',
                'jenjang_pendidikan' => 'sometimes|required|string|max:255',
                'instansi_pendidikan' => 'sometimes|required|string|max:255',
                'nim' => 'sometimes|nullable|string|max:50',
                'status_ijazah' => 'sometimes|required|string|max:255',
                'nomor_whatsapp' => 'sometimes|required|string|max:20',
                'email' => 'sometimes|required|email|max:255',
                'status_perkawinan' => 'sometimes|required|string|max:50',
                'melanjutkan_pendidikan' => 'sometimes|required|boolean',
                'ukuran_baju' => 'sometimes|required|string|max:10',
                'riwayat_penyakit' => 'sometimes|nullable|string|max:1000',
                'batch_id' => 'sometimes|required|exists:batch,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $application->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $application->load('batch'),
                'message' => 'Application updated successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error updating application: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function updateApplicationReviewStatus(Request $request, $id)
    {
        try {
            $application = ApplicantData::find($id);

            if (!$application) {
                return response()->json([
                    'success' => false,
                    'error' => 'APPLICATION_NOT_FOUND'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'review_status' => 'required|integer|in:1,2,3,4,5',
                'review_remark' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $application->update([
                'review_status' => $request->review_status,
                'review_remark' => $request->review_remark
            ]);

            return response()->json([
                'success' => true,
                'data' => $application->load('batch'),
                'message' => 'Application review status updated successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error updating application review status: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function updateApplicationGraduationStatus(Request $request, $id)
    {
        try {
            $application = ApplicantData::find($id);

            if (!$application) {
                return response()->json([
                    'success' => false,
                    'error' => 'APPLICATION_NOT_FOUND'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'graduation_status' => 'required|integer|in:1,2,3,4,5,6,7',
                'graduation_remark' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $application->update([
                'graduation_status' => $request->graduation_status,
                'graduation_remark' => $request->graduation_remark
            ]);

            return response()->json([
                'success' => true,
                'data' => $application->load('batch'),
                'message' => 'Application graduation status updated successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error updating application graduation status: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function deleteApplication($id)
    {
        try {
            $application = ApplicantData::find($id);

            if (!$application) {
                return response()->json([
                    'success' => false,
                    'error' => 'APPLICATION_NOT_FOUND'
                ], 404);
            }

            $application->delete();

            return response()->json([
                'success' => true,
                'message' => 'Application deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error deleting application: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    /**
     * Generate Excel file for applications
     */
    public function generateExcel(Request $request)
    {
        try {
            // Get pagination parameters to extract filters and search
            $paginationParams = $this->getPaginationParams($request);

            // Create generated file record
            $generatedFile = GeneratedFile::create([
                'type' => 'applications',
                'model_type' => 'applications',
                'model_id' => null, // No specific model ID for general applications export
                'ext' => 'xlsx',
                'path' => '', // Will be updated by the job
                'request_at' => Carbon::now(),
            ]);

            // Dispatch the job with filter parameters
            dispatch(new GenerateApplicationsExcelJob($generatedFile->id, $paginationParams));

            return response()->json([
                'success' => true,
                'message' => 'Excel generation started',
                'data' => [
                    'generated_file_id' => $generatedFile->id,
                    'status' => 'processing'
                ]
            ], 202);
        } catch (\Exception $e) {
            Log::error("Error starting applications Excel generation: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Error starting Excel generation'
            ], 500);
        }
    }

    /**
     * Generate Excel file for applications by batch
     */
    public function generateExcelByBatch(Request $request, $batchId)
    {
        try {
            // Verify batch exists
            $batch = Batch::find($batchId);
            if (!$batch) {
                return response()->json([
                    'success' => false,
                    'error' => 'BATCH_NOT_FOUND',
                    'message' => 'Batch not found'
                ], 404);
            }

            // Get pagination parameters to extract filters and search
            $paginationParams = $this->getPaginationParams($request);

            // Create generated file record
            $generatedFile = GeneratedFile::create([
                'type' => 'applications-by-batch',
                'model_type' => 'batch',
                'model_id' => $batchId,
                'ext' => 'xlsx',
                'path' => '', // Will be updated by the job
                'request_at' => Carbon::now(),
            ]);

            // Dispatch the job with batch ID and filter parameters
            dispatch(new GenerateApplicationsExcelJob($generatedFile->id, $paginationParams, $batchId));

            return response()->json([
                'success' => true,
                'message' => 'Excel generation started',
                'data' => [
                    'generated_file_id' => $generatedFile->id,
                    'batch_id' => $batchId,
                    'status' => 'processing'
                ]
            ], 202);
        } catch (\Exception $e) {
            Log::error("Error starting applications Excel generation by batch: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Error starting Excel generation'
            ], 500);
        }
    }
}
