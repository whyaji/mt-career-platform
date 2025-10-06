<?php

namespace App\Http\Controllers;

use App\Services\PDDIKTIService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PDDIKTIController extends Controller
{
    protected $pddiktiService;

    public function __construct(PDDIKTIService $pddiktiService)
    {
        $this->pddiktiService = $pddiktiService;
        $this->middleware('jwt.auth');
    }

    /**
     * Search across all categories in PDDIKTI
     */
    public function searchAll(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'keyword' => 'required|string|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $result = $this->pddiktiService->searchAll($request->keyword);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Search completed successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI search all failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'SEARCH_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search for students in PDDIKTI
     */
    public function searchMahasiswa(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'keyword' => 'required|string|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $result = $this->pddiktiService->searchMahasiswa($request->keyword);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Student search completed successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI student search failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'SEARCH_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search for lecturers in PDDIKTI
     */
    public function searchDosen(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'keyword' => 'required|string|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $result = $this->pddiktiService->searchDosen($request->keyword);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Lecturer search completed successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI lecturer search failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'SEARCH_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search for universities in PDDIKTI
     */
    public function searchPt(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'keyword' => 'required|string|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $result = $this->pddiktiService->searchPt($request->keyword);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'University search completed successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI university search failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'SEARCH_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search for study programs in PDDIKTI
     */
    public function searchProdi(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'keyword' => 'required|string|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $result = $this->pddiktiService->searchProdi($request->keyword);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Study program search completed successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI study program search failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'SEARCH_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detailed student information
     */
    public function getDetailMhs($mahasiswaId)
    {
        try {
            $result = $this->pddiktiService->getDetailMhs($mahasiswaId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Student details retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI student details failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'DETAILS_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get lecturer profile
     */
    public function getDosenProfile($dosenId)
    {
        try {
            $result = $this->pddiktiService->getDosenProfile($dosenId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Lecturer profile retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI lecturer profile failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'PROFILE_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get lecturer research activities
     */
    public function getDosenPenelitian($dosenId)
    {
        try {
            $result = $this->pddiktiService->getDosenPenelitian($dosenId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Lecturer research activities retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI lecturer research failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'RESEARCH_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get lecturer community service activities
     */
    public function getDosenPengabdian($dosenId)
    {
        try {
            $result = $this->pddiktiService->getDosenPengabdian($dosenId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Lecturer community service activities retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI lecturer community service failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'COMMUNITY_SERVICE_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get lecturer academic works
     */
    public function getDosenKarya($dosenId)
    {
        try {
            $result = $this->pddiktiService->getDosenKarya($dosenId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Lecturer academic works retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI lecturer academic works failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'ACADEMIC_WORKS_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get lecturer patents
     */
    public function getDosenPaten($dosenId)
    {
        try {
            $result = $this->pddiktiService->getDosenPaten($dosenId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Lecturer patents retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI lecturer patents failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'PATENTS_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get lecturer study history
     */
    public function getDosenStudyHistory($dosenId)
    {
        try {
            $result = $this->pddiktiService->getDosenStudyHistory($dosenId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Lecturer study history retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI lecturer study history failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'STUDY_HISTORY_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get lecturer teaching history
     */
    public function getDosenTeachingHistory($dosenId)
    {
        try {
            $result = $this->pddiktiService->getDosenTeachingHistory($dosenId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Lecturer teaching history retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI lecturer teaching history failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'TEACHING_HISTORY_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get university details
     */
    public function getDetailPt($ptId)
    {
        try {
            $result = $this->pddiktiService->getDetailPt($ptId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'University details retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI university details failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'UNIVERSITY_DETAILS_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get university study programs
     */
    public function getProdiPt(Request $request, $ptId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'tahun' => 'required|string|regex:/^\d{5}$/'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => 'Tahun must be in YYYYS format (5 digits)'
                ], 400);
            }

            $result = $this->pddiktiService->getProdiPt($ptId, $request->tahun);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'University study programs retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI university study programs failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'STUDY_PROGRAMS_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get university logo
     */
    public function getLogoPt($ptId)
    {
        try {
            $result = $this->pddiktiService->getLogoPt($ptId);

            if ($result === null) {
                return response()->json([
                    'success' => false,
                    'error' => 'LOGO_NOT_FOUND',
                    'message' => 'University logo not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'logo_base64' => $result
                ],
                'message' => 'University logo retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI university logo failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'LOGO_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get university ratio information
     */
    public function getRasioPt($ptId)
    {
        try {
            $result = $this->pddiktiService->getRasioPt($ptId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'University ratio information retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI university ratio failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'RATIO_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get university student statistics
     */
    public function getMahasiswaPt($ptId)
    {
        try {
            $result = $this->pddiktiService->getMahasiswaPt($ptId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'University student statistics retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI university student statistics failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'STUDENT_STATISTICS_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get study program details
     */
    public function getDetailProdi($prodiId)
    {
        try {
            $result = $this->pddiktiService->getDetailProdi($prodiId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Study program details retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI study program details failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'STUDY_PROGRAM_DETAILS_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get study program description and statistics
     */
    public function getDescProdi($prodiId)
    {
        try {
            $result = $this->pddiktiService->getDescProdi($prodiId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Study program description retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI study program description failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'STUDY_PROGRAM_DESCRIPTION_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get study program student and lecturer counts
     */
    public function getNumStudentsLecturersProdi($prodiId)
    {
        try {
            $result = $this->pddiktiService->getNumStudentsLecturersProdi($prodiId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Study program student and lecturer counts retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI study program counts failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'STUDY_PROGRAM_COUNTS_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get study program cost range
     */
    public function getCostRangeProdi($prodiId)
    {
        try {
            $result = $this->pddiktiService->getCostRangeProdi($prodiId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Study program cost range retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI study program cost range failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'COST_RANGE_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get study program capacity
     */
    public function getDayaTampungProdi($prodiId)
    {
        try {
            $result = $this->pddiktiService->getDayaTampungProdi($prodiId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Study program capacity retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI study program capacity failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'CAPACITY_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get study program lecturer-student ratio
     */
    public function getRasioDosenMahasiswaProdi($prodiId)
    {
        try {
            $result = $this->pddiktiService->getRasioDosenMahasiswaProdi($prodiId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Study program lecturer-student ratio retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI study program ratio failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'RATIO_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get study program graduation rate
     */
    public function getGraduationRateProdi($prodiId)
    {
        try {
            $result = $this->pddiktiService->getGraduationRateProdi($prodiId);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Study program graduation rate retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI study program graduation rate failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'GRADUATION_RATE_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Count Methods

    /**
     * Get count of active lecturers
     */
    public function getDosenCountActive()
    {
        try {
            $result = $this->pddiktiService->getDosenCountActive();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Active lecturer count retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI lecturer count failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'LECTURER_COUNT_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get count of active students
     */
    public function getMahasiswaCountActive()
    {
        try {
            $result = $this->pddiktiService->getMahasiswaCountActive();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Active student count retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI student count failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'STUDENT_COUNT_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get count of study programs
     */
    public function getProdiCount()
    {
        try {
            $result = $this->pddiktiService->getProdiCount();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Study program count retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI study program count failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'STUDY_PROGRAM_COUNT_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get count of universities
     */
    public function getPtCount()
    {
        try {
            $result = $this->pddiktiService->getPtCount();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'University count retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI university count failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'UNIVERSITY_COUNT_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Visualization Methods

    /**
     * Get lecturer activity data
     */
    public function getDataDosenKeaktifan()
    {
        try {
            $result = $this->pddiktiService->getDataDosenKeaktifan();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Lecturer activity data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI lecturer activity data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'LECTURER_ACTIVITY_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get lecturer field distribution data
     */
    public function getDataDosenBidang()
    {
        try {
            $result = $this->pddiktiService->getDataDosenBidang();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Lecturer field distribution data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI lecturer field data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'LECTURER_FIELD_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get lecturer gender distribution data
     */
    public function getDataDosenJenisKelamin()
    {
        try {
            $result = $this->pddiktiService->getDataDosenJenisKelamin();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Lecturer gender distribution data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI lecturer gender data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'LECTURER_GENDER_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get lecturer education level data
     */
    public function getDataDosenJenjang()
    {
        try {
            $result = $this->pddiktiService->getDataDosenJenjang();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Lecturer education level data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI lecturer education level data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'LECTURER_EDUCATION_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get lecturer employment binding data
     */
    public function getDataDosenIkatan()
    {
        try {
            $result = $this->pddiktiService->getDataDosenIkatan();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Lecturer employment binding data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI lecturer employment data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'LECTURER_EMPLOYMENT_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get student field distribution data
     */
    public function getDataMahasiswaBidang()
    {
        try {
            $result = $this->pddiktiService->getDataMahasiswaBidang();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Student field distribution data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI student field data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'STUDENT_FIELD_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get student gender distribution data
     */
    public function getDataMahasiswaJenisKelamin()
    {
        try {
            $result = $this->pddiktiService->getDataMahasiswaJenisKelamin();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Student gender distribution data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI student gender data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'STUDENT_GENDER_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get student education level data
     */
    public function getDataMahasiswaJenjang()
    {
        try {
            $result = $this->pddiktiService->getDataMahasiswaJenjang();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Student education level data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI student education level data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'STUDENT_EDUCATION_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get student institutional group data
     */
    public function getDataMahasiswaKelompokLembaga()
    {
        try {
            $result = $this->pddiktiService->getDataMahasiswaKelompokLembaga();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Student institutional group data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI student institutional group data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'STUDENT_INSTITUTIONAL_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get student status data
     */
    public function getDataMahasiswaStatus()
    {
        try {
            $result = $this->pddiktiService->getDataMahasiswaStatus();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Student status data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI student status data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'STUDENT_STATUS_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get university type data
     */
    public function getDataPtBentuk()
    {
        try {
            $result = $this->pddiktiService->getDataPtBentuk();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'University type data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI university type data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'UNIVERSITY_TYPE_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get university accreditation data
     */
    public function getDataPtAkreditasi()
    {
        try {
            $result = $this->pddiktiService->getDataPtAkreditasi();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'University accreditation data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI university accreditation data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'UNIVERSITY_ACCREDITATION_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get university administrative overseer data
     */
    public function getDataPtKelompokPembina()
    {
        try {
            $result = $this->pddiktiService->getDataPtKelompokPembina();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'University administrative overseer data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI university administrative overseer data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'UNIVERSITY_ADMINISTRATIVE_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get university province distribution data
     */
    public function getDataPtProvinsi()
    {
        try {
            $result = $this->pddiktiService->getDataPtProvinsi();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'University province distribution data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI university province data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'UNIVERSITY_PROVINCE_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get study program level data
     */
    public function getDataProdiJenjang()
    {
        try {
            $result = $this->pddiktiService->getDataProdiJenjang();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Study program level data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI study program level data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'STUDY_PROGRAM_LEVEL_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get study program accreditation data
     */
    public function getDataProdiAkreditasi()
    {
        try {
            $result = $this->pddiktiService->getDataProdiAkreditasi();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Study program accreditation data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI study program accreditation data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'STUDY_PROGRAM_ACCREDITATION_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get study program field of science data
     */
    public function getDataProdiBidangIlmu()
    {
        try {
            $result = $this->pddiktiService->getDataProdiBidangIlmu();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Study program field of science data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI study program field of science data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'STUDY_PROGRAM_FIELD_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get study program administrative overseer data
     */
    public function getDataProdiKelompokPembina()
    {
        try {
            $result = $this->pddiktiService->getDataProdiKelompokPembina();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Study program administrative overseer data retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI study program administrative overseer data failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'STUDY_PROGRAM_ADMINISTRATIVE_DATA_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Additional Methods

    /**
     * Get contributor information
     */
    public function getContributor()
    {
        try {
            $result = $this->pddiktiService->getContributor();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Contributor information retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI contributor information failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'CONTRIBUTOR_INFO_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get news articles
     */
    public function getNews()
    {
        try {
            $result = $this->pddiktiService->getNews();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'News articles retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI news articles failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'NEWS_ARTICLES_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get field of sciences
     */
    public function getBidangIlmuProdi()
    {
        try {
            $result = $this->pddiktiService->getBidangIlmuProdi();

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Field of sciences retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI field of sciences failed: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'FIELD_OF_SCIENCES_FAILED',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check student graduation status
     */
    public function checkStatusKelulusan(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nama' => 'nullable|string|max:255',
                'nim' => 'nullable|string|max:50',
                'program_studi' => 'nullable|string|max:255',
                'universitas' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $data = $request->all();

            // Check if at least one field is provided
            if (
                empty(trim($data['nama'] ?? '')) &&
                empty(trim($data['nim'] ?? '')) &&
                empty(trim($data['program_studi'] ?? '')) &&
                empty(trim($data['universitas'] ?? ''))
            ) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => "At least one of 'nama', 'nim', 'program_studi', or 'universitas' must be provided"
                ], 400);
            }

            $result = $this->pddiktiService->checkStatusKelulusan($data);

            // If no results found, return 404
            if ($result['total_found'] === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mahasiswa tidak ditemukan',
                    'suggestions' => [
                        'Nama, NIM, program studi, atau universitas tidak terdaftar di PDDIKTI',
                        'Data belum terupdate di sistem',
                        'Kesalahan penulisan kriteria pencarian',
                        'Coba dengan kriteria pencarian yang berbeda'
                    ]
                ], 404);
            }

            return response()->json($result, 200);
        } catch (Exception $e) {
            Log::error("PDDIKTI graduation status check failed: {$e->getMessage()}");

            // Handle specific error types
            if (strpos($e->getMessage(), 'At least one of') !== false) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $e->getMessage()
                ], 400);
            }

            return response()->json([
                'success' => false,
                'error' => 'GRADUATION_STATUS_CHECK_FAILED',
                'message' => 'Error checking graduation status'
            ], 500);
        }
    }
}
