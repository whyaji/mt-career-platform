<?php

namespace App\Http\Controllers;

use App\Models\EducationalInstitution;
use App\Traits\PaginationTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class EducationalInstitutionController extends Controller
{
    use PaginationTrait;

    public function __construct()
    {
        $this->middleware('jwt.auth', ['except' => ['getActive']]);
    }

    public function getActive(Request $request)
    {
        try {
            $institutions = EducationalInstitution::active()
                ->select('id', 'name', 'status')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $institutions
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting active educational institutions: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getInstitutions(Request $request)
    {
        try {
            // Get pagination parameters
            $paginationParams = $this->getPaginationParams($request);

            // Define searchable fields
            $searchableFields = ['name'];

            // Build query
            $query = EducationalInstitution::select('id', 'name', 'status', 'created_at', 'updated_at');

            // Apply pagination with search
            $result = $this->paginateQuery($query, $paginationParams, $searchableFields);

            return $this->paginatedResponse($result, 'Educational institutions retrieved successfully');
        } catch (\Exception $e) {
            Log::error("Error getting all educational institutions: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getInstitutionById($id)
    {
        try {
            $institution = EducationalInstitution::find($id);

            if (!$institution) {
                return response()->json([
                    'success' => false,
                    'error' => 'INSTITUTION_NOT_FOUND'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $institution
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting educational institution by ID: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function createInstitution(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:128',
                'status' => 'required|integer|in:0,1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            // Check if institution with same name already exists
            $existingInstitution = EducationalInstitution::where('name', $request->name)
                ->first();

            if ($existingInstitution) {
                return response()->json([
                    'success' => false,
                    'error' => 'INSTITUTION_ALREADY_EXISTS',
                    'message' => 'An educational institution with this name already exists'
                ], 409);
            }

            $institution = EducationalInstitution::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $institution,
                'message' => 'Educational institution created successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error("Error creating educational institution: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function updateInstitution(Request $request, $id)
    {
        try {
            $institution = EducationalInstitution::find($id);

            if (!$institution) {
                return response()->json([
                    'success' => false,
                    'error' => 'INSTITUTION_NOT_FOUND'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:128',
                'status' => 'sometimes|required|integer|in:0,1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            // Check if another institution with same name exists (excluding current institution)
            if ($request->has('name')) {
                $existingInstitution = EducationalInstitution::where('name', $request->name)
                    ->where('id', '!=', $id)
                    ->first();

                if ($existingInstitution) {
                    return response()->json([
                        'success' => false,
                        'error' => 'INSTITUTION_ALREADY_EXISTS',
                        'message' => 'An educational institution with this name already exists'
                    ], 409);
                }
            }

            $institution->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $institution,
                'message' => 'Educational institution updated successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error updating educational institution: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function deleteInstitution($id)
    {
        try {
            $institution = EducationalInstitution::find($id);

            if (!$institution) {
                return response()->json([
                    'success' => false,
                    'error' => 'INSTITUTION_NOT_FOUND'
                ], 404);
            }

            $institution->delete();

            return response()->json([
                'success' => true,
                'message' => 'Educational institution deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error deleting educational institution: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }
}
