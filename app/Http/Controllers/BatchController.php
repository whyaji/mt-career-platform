<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Traits\PaginationTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BatchController extends Controller
{
    use PaginationTrait;

    public function __construct()
    {
        $this->middleware('jwt.auth');
    }

    public function getActive(Request $request)
    {
        try {
            $batches = Batch::active()
                ->select('id', 'number', 'number_code', 'location', 'location_code', 'year', 'institutes', 'program_category_id')
                ->with('programCategory:id,code,name,description,status')
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
            $searchableFields = ['number', 'number_code', 'location', 'location_code', 'year', 'program_category_id'];

            // Build query
            $query = Batch::select('id', 'number', 'number_code', 'location', 'location_code', 'year', 'institutes', 'status', 'program_category_id')
                ->with('programCategory:id,code,name,description,status');

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

    public function getBatchById($id)
    {
        try {
            $batch = Batch::with('programCategory:id,code,name,description,status')->find($id);

            if (!$batch) {
                return response()->json([
                    'success' => false,
                    'error' => 'BATCH_NOT_FOUND'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $batch
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting batch by ID: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function createBatch(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'number' => 'required|integer|min:1',
                'number_code' => 'required|string|max:10',
                'location' => 'required|string|max:255',
                'location_code' => 'required|string|max:10',
                'year' => 'required|integer|min:2000|max:2100',
                'status' => 'required|integer|in:0,1',
                'institutes' => 'nullable|array',
                'institutes.*' => 'string|max:255',
                'program_category_id' => 'nullable|uuid|exists:program_category,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            // Check if batch with same number and location already exists
            $existingBatch = Batch::where('number', $request->number)
                ->where('location_code', $request->location_code)
                ->first();

            if ($existingBatch) {
                return response()->json([
                    'success' => false,
                    'error' => 'BATCH_ALREADY_EXISTS',
                    'message' => 'A batch with this number and location code already exists'
                ], 409);
            }

            $batch = Batch::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $batch,
                'message' => 'Batch created successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error("Error creating batch: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function updateBatch(Request $request, $id)
    {
        try {
            $batch = Batch::find($id);

            if (!$batch) {
                return response()->json([
                    'success' => false,
                    'error' => 'BATCH_NOT_FOUND'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'number' => 'sometimes|required|integer|min:1',
                'number_code' => 'sometimes|required|string|max:10',
                'location' => 'sometimes|required|string|max:255',
                'location_code' => 'sometimes|required|string|max:10',
                'year' => 'sometimes|required|integer|min:2000|max:2100',
                'status' => 'sometimes|required|integer|in:0,1',
                'institutes' => 'nullable|array',
                'institutes.*' => 'string|max:255',
                'program_category_id' => 'nullable|uuid|exists:program_category,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            // Check if another batch with same number and location exists (excluding current batch)
            if ($request->has('number') && $request->has('location_code')) {
                $existingBatch = Batch::where('number', $request->number)
                    ->where('location_code', $request->location_code)
                    ->where('id', '!=', $id)
                    ->first();

                if ($existingBatch) {
                    return response()->json([
                        'success' => false,
                        'error' => 'BATCH_ALREADY_EXISTS',
                        'message' => 'A batch with this number and location code already exists'
                    ], 409);
                }
            }

            $batch->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $batch,
                'message' => 'Batch updated successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error updating batch: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function deleteBatch($id)
    {
        try {
            $batch = Batch::with('programCategory:id,code,name,description,status')->find($id);

            if (!$batch) {
                return response()->json([
                    'success' => false,
                    'error' => 'BATCH_NOT_FOUND'
                ], 404);
            }

            $batch->delete();

            return response()->json([
                'success' => true,
                'message' => 'Batch deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error deleting batch: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }
}
