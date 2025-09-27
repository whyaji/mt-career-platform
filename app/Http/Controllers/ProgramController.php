<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\ProgramCategory;
use App\Traits\PaginationTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ProgramController extends Controller
{
    use PaginationTrait;

    public function __construct()
    {
        $this->middleware('jwt.auth');
    }

    public function getActive(Request $request)
    {
        try {
            $programs = Program::active()
                ->select(
                    'id',
                    'code',
                    'name',
                    'program_category_id',
                    'description',
                    'min_education',
                    'majors',
                    'min_gpa',
                    'marital_status',
                    'placement',
                    'training_duration',
                    'ojt_duration',
                    'contract_duration'
                )
                ->get();

            return response()->json([
                'success' => true,
                'data' => $programs
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting active programs: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getPrograms(Request $request)
    {
        try {
            // Get pagination parameters
            $paginationParams = $this->getPaginationParams($request);

            // Define searchable fields
            $searchableFields = ['name', 'code', 'description', 'placement'];

            // Build query with relationship
            $query = Program::with('programCategory')
                ->select(
                    'id',
                    'code',
                    'name',
                    'program_category_id',
                    'description',
                    'min_education',
                    'majors',
                    'min_gpa',
                    'marital_status',
                    'placement',
                    'training_duration',
                    'ojt_duration',
                    'contract_duration',
                    'status',
                    'created_at',
                    'updated_at'
                );

            // Apply pagination with search
            $result = $this->paginateQuery($query, $paginationParams, $searchableFields);

            return $this->paginatedResponse($result, 'Programs retrieved successfully');
        } catch (\Exception $e) {
            Log::error("Error getting all programs: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getProgramById($id)
    {
        try {
            $program = Program::find($id);

            if (!$program) {
                return response()->json([
                    'success' => false,
                    'error' => 'PROGRAM_NOT_FOUND'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $program
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting program by ID: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function createProgram(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|max:50|unique:program,code',
                'name' => 'required|string|max:255',
                'program_category_id' => 'required|exists:program_category,id',
                'description' => 'nullable|string',
                'min_education' => 'required|string|in:D3,D4,S1,S2',
                'majors' => 'required|array|min:1',
                'majors.*' => 'string|max:255',
                'min_gpa' => 'required|numeric|min:0|max:4',
                'marital_status' => 'required|string|in:single,any',
                'placement' => 'required|string|max:255',
                'training_duration' => 'required|integer|min:0',
                'ojt_duration' => 'required|integer|min:0',
                'contract_duration' => 'nullable|integer|min:0',
                'status' => 'required|integer|in:0,1'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $program = Program::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $program,
                'message' => 'Program created successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error("Error creating program: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function updateProgram(Request $request, $id)
    {
        try {
            $program = Program::find($id);

            if (!$program) {
                return response()->json([
                    'success' => false,
                    'error' => 'PROGRAM_NOT_FOUND'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'code' => 'sometimes|required|string|max:50|unique:program,code,' . $id,
                'name' => 'sometimes|required|string|max:255',
                'program_category_id' => 'sometimes|required|exists:program_category,id',
                'description' => 'nullable|string',
                'min_education' => 'sometimes|required|string|in:D3,D4,S1,S2',
                'majors' => 'sometimes|required|array|min:1',
                'majors.*' => 'string|max:255',
                'min_gpa' => 'sometimes|required|numeric|min:0|max:4',
                'marital_status' => 'sometimes|required|string|in:single,any',
                'placement' => 'sometimes|required|string|max:255',
                'training_duration' => 'sometimes|required|integer|min:0',
                'ojt_duration' => 'sometimes|required|integer|min:0',
                'contract_duration' => 'nullable|integer|min:0',
                'status' => 'sometimes|required|integer|in:0,1'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $program->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $program,
                'message' => 'Program updated successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error updating program: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function deleteProgram($id)
    {
        try {
            $program = Program::find($id);

            if (!$program) {
                return response()->json([
                    'success' => false,
                    'error' => 'PROGRAM_NOT_FOUND'
                ], 404);
            }

            $program->delete();

            return response()->json([
                'success' => true,
                'message' => 'Program deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error deleting program: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }
}
