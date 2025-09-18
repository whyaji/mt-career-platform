<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Traits\PaginationTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BatchController extends Controller
{
    use PaginationTrait;

    public function __construct()
    {
        $this->middleware('jwt.auth', ['except' => ['getActive']]);
    }

    public function getActive(Request $request)
    {
        try {
            $batches = Batch::active()
                ->select('id', 'number', 'number_code', 'location', 'location_code', 'year', 'institutes')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $batches
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting active batches: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getBatches(Request $request)
    {
        try {
            // Get pagination parameters
            $paginationParams = $this->getPaginationParams($request);

            // Define searchable fields
            $searchableFields = ['number', 'number_code', 'location', 'location_code', 'year'];

            // Build query
            $query = Batch::select('id', 'number', 'number_code', 'location', 'location_code', 'year', 'institutes', 'status');

            // Apply pagination with search
            $result = $this->paginateQuery($query, $paginationParams, $searchableFields);

            return $this->paginatedResponse($result, 'Batches retrieved successfully');

        } catch (\Exception $e) {
            Log::error("Error getting all batches: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }
}
