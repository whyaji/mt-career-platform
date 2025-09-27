<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\ProgramCategory;
use App\Traits\PaginationTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OpenProgramController extends Controller
{
    use PaginationTrait;

    public function __construct()
    {
        $this->middleware('jwt.auth');
    }

    public function getOpenPrograms(Request $request)
    {
        // in this controller, show the list batch with status active and has program category and it status active
        try {
            $paginationParams = $this->getPaginationParams($request);
            $searchableFields = ['number', 'number_code', 'location', 'location_code', 'year', 'program_category_id'];

            // Handle custom sorting for program_category fields
            if (in_array($paginationParams['sort_by'], ['program_category.name', 'program_category.code'])) {
                $query = $this->buildQueryWithSorting($paginationParams['sort_by'], $paginationParams['order']);
            } else {
                $query = Batch::openPrograms();
            }

            // Handle search in program_category fields
            if (!empty($paginationParams['search'])) {
                $this->applyRelationshipSearch($query, $paginationParams['search'], $searchableFields);
            }

            $result = $this->paginateQuery($query, $paginationParams, []);
            return $this->paginatedResponse($result, 'Open programs retrieved successfully');
        } catch (\Exception $e) {
            Log::error("Error getting open programs: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    /**
     * Build query with proper sorting for relationship fields
     */
    private function buildQueryWithSorting($sortBy, $order)
    {
        if ($sortBy === 'program_category.name') {
            return Batch::select('batch.*')
                ->join('program_category', 'batch.program_category_id', '=', 'program_category.id')
                ->where('batch.status', Batch::STATUS_ACTIVE)
                ->whereNull('batch.deleted_at')
                ->where('program_category.status', ProgramCategory::STATUS_ACTIVE)
                ->whereNull('program_category.deleted_at')
                ->orderBy('program_category.name', $order)
                ->with('programCategory:id,code,name,description,status');
        } elseif ($sortBy === 'program_category.code') {
            return Batch::select('batch.*')
                ->join('program_category', 'batch.program_category_id', '=', 'program_category.id')
                ->where('batch.status', Batch::STATUS_ACTIVE)
                ->whereNull('batch.deleted_at')
                ->where('program_category.status', ProgramCategory::STATUS_ACTIVE)
                ->whereNull('program_category.deleted_at')
                ->orderBy('program_category.code', $order)
                ->with('programCategory:id,code,name,description,status');
        }

        return Batch::openPrograms();
    }

    /**
     * Apply search including relationship fields
     */
    private function applyRelationshipSearch($query, $search, $searchableFields)
    {
        $query->where(function ($q) use ($search, $searchableFields) {
            // Search in batch fields
            foreach ($searchableFields as $field) {
                $q->orWhere($field, 'LIKE', "%{$search}%");
            }

            // Search in program_category fields
            $q->orWhereHas('programCategory', function ($categoryQuery) use ($search) {
                $categoryQuery->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('code', 'LIKE', "%{$search}%");
            });
        });
    }
}
