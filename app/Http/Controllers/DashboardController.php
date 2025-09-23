<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\ApplicantData;
use App\Models\EducationalInstitution;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get total counts for dashboard statistics
     *
     * @return JsonResponse
     */
    public function getCounts(): JsonResponse
    {
        try {
            $counts = [
                'total_batches' => Batch::count(),
                'total_applicants' => ApplicantData::count(),
                'total_institutions' => EducationalInstitution::count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $counts,
                'message' => 'Dashboard counts retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard counts',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
