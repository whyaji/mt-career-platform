<?php

namespace App\Http\Controllers;

use App\Models\ProgramCategory;
use App\Traits\PaginationTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ProgramCategoryController extends Controller
{
    use PaginationTrait;

    public function __construct()
    {
        $this->middleware('jwt.auth', ['except' => ['getActive']]);
    }

    public function getActive(Request $request)
    {
        try {
            $categories = ProgramCategory::active()
                ->select('id', 'code', 'name', 'description')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $categories
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting active program categories: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getProgramCategories(Request $request)
    {
        try {
            // Get pagination parameters
            $paginationParams = $this->getPaginationParams($request);

            // Define searchable fields
            $searchableFields = ['name', 'code', 'description'];

            // Build query
            $query = ProgramCategory::select('id', 'code', 'name', 'description', 'status', 'created_at', 'updated_at');

            // Apply pagination with search
            $result = $this->paginateQuery($query, $paginationParams, $searchableFields);

            return $this->paginatedResponse($result, 'Program categories retrieved successfully');
        } catch (\Exception $e) {
            Log::error("Error getting all program categories: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getProgramCategoryById($id)
    {
        try {
            $category = ProgramCategory::find($id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'error' => 'PROGRAM_CATEGORY_NOT_FOUND'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $category
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting program category by ID: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function createProgramCategory(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|max:50|unique:program_category,code',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|integer|in:0,1'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $category = ProgramCategory::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Program category created successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error("Error creating program category: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function updateProgramCategory(Request $request, $id)
    {
        try {
            $category = ProgramCategory::find($id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'error' => 'PROGRAM_CATEGORY_NOT_FOUND'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'code' => 'sometimes|required|string|max:50|unique:program_category,code,' . $id,
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'sometimes|required|integer|in:0,1'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $category->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Program category updated successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error updating program category: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function deleteProgramCategory($id)
    {
        try {
            $category = ProgramCategory::find($id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'error' => 'PROGRAM_CATEGORY_NOT_FOUND'
                ], 404);
            }

            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Program category deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error deleting program category: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }
}
