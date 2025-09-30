<?php

namespace App\Http\Controllers;

use App\Models\GeneratedFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class GlobalGeneratedFileController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt.auth');
    }

    /**
     * Get list of generated files with flexible filtering
     *
     * POST /api/v1/generated-files/list
     * Body: {
     *   "filters": {
     *     "type": "screening-applicants-by-batch",
     *     "model_type": "batch",
     *     "model_id": "batch-uuid",
     *     "ext": "xlsx",
     *     "date_from": "2025-01-01",
     *     "date_to": "2025-12-31",
     *     "is_ready": true
     *   },
     *   "pagination": {
     *     "page": 1,
     *     "per_page": 20
     *   },
     *   "sort": {
     *     "field": "created_at",
     *     "direction": "desc"
     *   }
     * }
     */
    public function getGeneratedFiles(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'filters' => 'nullable|array',
                'filters.type' => 'nullable|string',
                'filters.model_type' => 'nullable|string',
                'filters.model_id' => 'nullable|string',
                'filters.ext' => 'nullable|string',
                'filters.date_from' => 'nullable|date',
                'filters.date_to' => 'nullable|date|after_or_equal:filters.date_from',
                'filters.is_ready' => 'nullable|boolean',
                'filters.search' => 'nullable|string',
                'pagination' => 'nullable|array',
                'pagination.page' => 'nullable|integer|min:1',
                'pagination.per_page' => 'nullable|integer|min:1|max:100',
                'sort' => 'nullable|array',
                'sort.field' => 'nullable|string|in:created_at,request_at,type,model_type,model_id,ext',
                'sort.direction' => 'nullable|string|in:asc,desc'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $filters = $request->input('filters', []);
            $pagination = $request->input('pagination', []);
            $sort = $request->input('sort', []);

            // Debug logging
            Log::info('GlobalGeneratedFiles API called with filters:', $filters);

            // Build query
            $query = GeneratedFile::query();

            // Apply filters
            if (!empty($filters['type'])) {
                $query->where('type', $filters['type']);
            }

            if (!empty($filters['model_type'])) {
                $query->where('model_type', $filters['model_type']);
            }

            if (!empty($filters['model_id'])) {
                $query->where('model_id', $filters['model_id']);
            }

            if (!empty($filters['ext'])) {
                $query->where('ext', $filters['ext']);
            }

            if (!empty($filters['date_from'])) {
                $query->whereDate('created_at', '>=', $filters['date_from']);
            }

            if (!empty($filters['date_to'])) {
                $query->whereDate('created_at', '<=', $filters['date_to']);
            }

            // Apply general search across multiple fields
            if (!empty($filters['search'])) {
                $searchTerm = $filters['search'];
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('type', 'like', "%{$searchTerm}%")
                        ->orWhere('model_id', 'like', "%{$searchTerm}%")
                        ->orWhere('model_type', 'like', "%{$searchTerm}%");
                });
            }

            // Note: is_ready filter is applied after database query since it depends on file existence

            // Apply sorting
            $sortField = $sort['field'] ?? 'created_at';
            $sortDirection = $sort['direction'] ?? 'desc';
            $query->orderBy($sortField, $sortDirection);

            // Apply pagination
            $page = $pagination['page'] ?? 1;
            $perPage = $pagination['per_page'] ?? 20;

            $generatedFiles = $query->paginate($perPage, ['*'], 'page', $page);

            // Transform data
            $transformedData = collect($generatedFiles->items())->map(function ($file) use ($filters) {
                $fileData = [
                    'id' => $file->id,
                    'type' => $file->type,
                    'model_type' => $file->model_type,
                    'model_id' => $file->model_id,
                    'ext' => $file->ext,
                    'request_at' => $file->request_at,
                    'created_at' => $file->created_at,
                    'updated_at' => $file->updated_at,
                    'is_ready' => $file->fileExists(),
                    'download_url' => $file->fileExists() ? $file->download_url : null,
                    'file_size' => $file->fileExists() ? filesize($file->getFullPathAttribute()) : null,
                ];

                // Only include is_ready filter if specifically requested
                if (isset($filters['is_ready'])) {
                    if ($filters['is_ready'] && !$fileData['is_ready']) {
                        return null; // Filter out non-ready files
                    } elseif (!$filters['is_ready'] && $fileData['is_ready']) {
                        return null; // Filter out ready files
                    }
                }

                return $fileData;
            })->filter(); // Remove null values

            // Pagination info
            $paginationInfo = [
                'current_page' => $generatedFiles->currentPage(),
                'per_page' => $generatedFiles->perPage(),
                'total' => $generatedFiles->total(),
                'last_page' => $generatedFiles->lastPage(),
                'from' => $generatedFiles->firstItem(),
                'to' => $generatedFiles->lastItem(),
                'has_more_pages' => $generatedFiles->hasMorePages(),
            ];

            return response()->json([
                'success' => true,
                'data' => $transformedData->values(),
                'pagination' => $paginationInfo,
                'message' => 'Generated files retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting generated files: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Error getting generated files'
            ], 500);
        }
    }

    /**
     * Get status of multiple generated files
     *
     * POST /api/v1/generated-files/status
     * Body: {
     *   "file_ids": ["uuid1", "uuid2", "uuid3"]
     * }
     */
    public function getGeneratedFilesStatus(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file_ids' => 'required|array|min:1|max:50',
                'file_ids.*' => 'required|uuid'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $fileIds = $request->input('file_ids');
            $generatedFiles = GeneratedFile::whereIn('id', $fileIds)->get();

            $statusData = [];
            $notFoundIds = [];

            foreach ($fileIds as $fileId) {
                $file = $generatedFiles->find($fileId);

                if ($file) {
                    $statusData[] = [
                        'id' => $file->id,
                        'type' => $file->type,
                        'model_type' => $file->model_type,
                        'model_id' => $file->model_id,
                        'ext' => $file->ext,
                        'request_at' => $file->request_at,
                        'created_at' => $file->created_at,
                        'is_ready' => $file->fileExists(),
                        'download_url' => $file->fileExists() ? $file->download_url : null,
                        'file_size' => $file->fileExists() ? filesize($file->getFullPathAttribute()) : null,
                    ];
                } else {
                    $notFoundIds[] = $fileId;
                }
            }

            $response = [
                'success' => true,
                'data' => $statusData,
                'message' => 'Generated files status retrieved successfully'
            ];

            if (!empty($notFoundIds)) {
                $response['not_found'] = $notFoundIds;
                $response['message'] = 'Some files were not found';
            }

            return response()->json($response, 200);
        } catch (\Exception $e) {
            Log::error("Error getting generated files status: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Error getting generated files status'
            ], 500);
        }
    }

    /**
     * Download multiple generated files as ZIP
     *
     * POST /api/v1/generated-files/download
     * Body: {
     *   "file_ids": ["uuid1", "uuid2", "uuid3"]
     * }
     */
    public function downloadGeneratedFiles(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file_ids' => 'required|array|min:1|max:10',
                'file_ids.*' => 'required|uuid'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $fileIds = $request->input('file_ids');
            $generatedFiles = GeneratedFile::whereIn('id', $fileIds)->get();

            if ($generatedFiles->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'error' => 'FILES_NOT_FOUND',
                    'message' => 'No files found with the provided IDs'
                ], 404);
            }

            // If only one file, return it directly
            if ($generatedFiles->count() === 1) {
                $file = $generatedFiles->first();

                if (!$file->fileExists()) {
                    return response()->json([
                        'success' => false,
                        'error' => 'FILE_NOT_READY',
                        'message' => 'File is not ready for download'
                    ], 404);
                }

                $filePath = $file->getFullPathAttribute();
                $filename = basename($filePath);

                return response()->download($filePath, $filename);
            }

            // Multiple files - create ZIP
            $zipFilename = 'generated-files-' . Carbon::now()->format('Y-m-d_H-i-s') . '.zip';
            $zipPath = public_path('temp/' . $zipFilename);

            // Create temp directory if it doesn't exist
            $tempDir = public_path('temp');
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            $zip = new \ZipArchive();
            if ($zip->open($zipPath, \ZipArchive::CREATE) !== TRUE) {
                return response()->json([
                    'success' => false,
                    'error' => 'ZIP_CREATION_FAILED',
                    'message' => 'Failed to create ZIP file'
                ], 500);
            }

            $addedFiles = 0;
            foreach ($generatedFiles as $file) {
                if ($file->fileExists()) {
                    $filePath = $file->getFullPathAttribute();
                    $filename = basename($filePath);

                    // Ensure unique filename in ZIP
                    $zipFilename = $filename;
                    $counter = 1;
                    while ($zip->locateName($zipFilename) !== false) {
                        $pathInfo = pathinfo($filename);
                        $zipFilename = $pathInfo['filename'] . '_' . $counter . '.' . $pathInfo['extension'];
                        $counter++;
                    }

                    $zip->addFile($filePath, $zipFilename);
                    $addedFiles++;
                }
            }

            $zip->close();

            if ($addedFiles === 0) {
                unlink($zipPath); // Clean up empty ZIP
                return response()->json([
                    'success' => false,
                    'error' => 'NO_READY_FILES',
                    'message' => 'No files are ready for download'
                ], 404);
            }

            // Return ZIP file for download
            $response = response()->download($zipPath, $zipFilename);

            // Schedule cleanup of temp file after download
            register_shutdown_function(function () use ($zipPath) {
                if (file_exists($zipPath)) {
                    unlink($zipPath);
                }
            });

            return $response;
        } catch (\Exception $e) {
            Log::error("Error downloading generated files: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Error downloading generated files'
            ], 500);
        }
    }

    /**
     * Get statistics about generated files
     *
     * POST /api/v1/generated-files/stats
     * Body: {
     *   "filters": {
     *     "type": "screening-applicants-by-batch",
     *     "model_type": "batch",
     *     "date_from": "2025-01-01",
     *     "date_to": "2025-12-31"
     *   }
     * }
     */
    public function getGeneratedFilesStats(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'filters' => 'nullable|array',
                'filters.type' => 'nullable|string',
                'filters.model_type' => 'nullable|string',
                'filters.date_from' => 'nullable|date',
                'filters.date_to' => 'nullable|date|after_or_equal:filters.date_from'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $filters = $request->input('filters', []);
            $query = GeneratedFile::query();

            // Apply filters
            if (!empty($filters['type'])) {
                $query->where('type', $filters['type']);
            }

            if (!empty($filters['model_type'])) {
                $query->where('model_type', $filters['model_type']);
            }

            if (!empty($filters['date_from'])) {
                $query->whereDate('created_at', '>=', $filters['date_from']);
            }

            if (!empty($filters['date_to'])) {
                $query->whereDate('created_at', '<=', $filters['date_to']);
            }

            $allFiles = $query->get();

            $stats = [
                'total_files' => $allFiles->count(),
                'ready_files' => $allFiles->filter(function ($file) {
                    return $file->fileExists();
                })->count(),
                'pending_files' => $allFiles->filter(function ($file) {
                    return !$file->fileExists();
                })->count(),
                'total_size' => 0,
                'by_type' => [],
                'by_model_type' => [],
                'by_extension' => [],
                'created_today' => $allFiles->filter(function ($file) {
                    return $file->created_at->isToday();
                })->count(),
                'created_this_week' => $allFiles->filter(function ($file) {
                    return $file->created_at->isCurrentWeek();
                })->count(),
                'created_this_month' => $allFiles->filter(function ($file) {
                    return $file->created_at->isCurrentMonth();
                })->count(),
            ];

            // Calculate total size and group by various criteria
            foreach ($allFiles as $file) {
                if ($file->fileExists()) {
                    $fileSize = filesize($file->getFullPathAttribute());
                    $stats['total_size'] += $fileSize;
                }

                // Group by type
                $type = $file->type;
                $stats['by_type'][$type] = ($stats['by_type'][$type] ?? 0) + 1;

                // Group by model type
                $modelType = $file->model_type ?? 'unknown';
                $stats['by_model_type'][$modelType] = ($stats['by_model_type'][$modelType] ?? 0) + 1;

                // Group by extension
                $ext = $file->ext;
                $stats['by_extension'][$ext] = ($stats['by_extension'][$ext] ?? 0) + 1;
            }

            // Format total size
            $stats['total_size_formatted'] = $this->formatBytes($stats['total_size']);

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Generated files statistics retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting generated files statistics: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Error getting generated files statistics'
            ], 500);
        }
    }

    /**
     * Delete multiple generated files
     *
     * DELETE /api/v1/generated-files
     * Body: {
     *   "file_ids": ["uuid1", "uuid2", "uuid3"]
     * }
     */
    public function deleteGeneratedFiles(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file_ids' => 'required|array|min:1|max:50',
                'file_ids.*' => 'required|uuid'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $fileIds = $request->input('file_ids');
            $generatedFiles = GeneratedFile::whereIn('id', $fileIds)->get();

            $deletedCount = 0;
            $notFoundIds = [];

            foreach ($fileIds as $fileId) {
                $file = $generatedFiles->find($fileId);

                if ($file) {
                    $file->delete(); // This will trigger the model's deleted event to remove the physical file
                    $deletedCount++;
                } else {
                    $notFoundIds[] = $fileId;
                }
            }

            $response = [
                'success' => true,
                'data' => [
                    'deleted_count' => $deletedCount,
                    'not_found_count' => count($notFoundIds)
                ],
                'message' => "Successfully deleted {$deletedCount} files"
            ];

            if (!empty($notFoundIds)) {
                $response['not_found'] = $notFoundIds;
                $response['message'] .= ", {$notFoundIds} files were not found";
            }

            return response()->json($response, 200);
        } catch (\Exception $e) {
            Log::error("Error deleting generated files: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Error deleting generated files'
            ], 500);
        }
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
