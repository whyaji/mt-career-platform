<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\ProgramCategory;
use App\Models\BatchQuestion;

class VerificationController extends Controller
{
    public function path($batchLocation, $batchNumber)
    {
        $batch = Batch::isPathValid($batchLocation, $batchNumber);
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
    }

    public function formPath($programCategoryCode, $batchLocationCode, $batchNumberCode)
    {
        // add with program
        $programCategory = ProgramCategory::select('id', 'code', 'name', 'description')
            ->where('code', strtoupper($programCategoryCode))->where('status', ProgramCategory::STATUS_ACTIVE)
            ->with(['programs:id,program_category_id,name,min_education,majors'])
            ->first();

        if (!$programCategory) {
            return response()->json([
                'success' => false,
                'error' => 'PROGRAM_CATEGORY_NOT_FOUND',
                'message' => 'Program category not found'
            ], 404);
        }

        $batch = Batch::select('id', 'number', 'number_code', 'location', 'location_code', 'year', 'institutes')
            ->where('program_category_id', $programCategory->id)->where('location_code', $batchLocationCode)
            ->where('status', Batch::STATUS_ACTIVE)->where('number_code', $batchNumberCode)->first();

        if (!$batch) {
            return response()->json([
                'success' => false,
                'error' => 'BATCH_NOT_FOUND',
                'message' => 'Batch not found'
            ], 404);
        }

        // Get batch questions with merged configuration
        $batchQuestions = BatchQuestion::where('batch_id', $batch->id)
            ->with('question')
            ->active()
            ->orderBy('display_order')
            ->get();

        // Get merged configurations for each batch question
        $questions = $batchQuestions->map(function ($batchQuestion) {
            return $batchQuestion->getMergedConfig(true);
        })->filter();

        // Add questions to batch data
        $batchData = $batch->toArray();
        $batchData['program_category'] = $programCategory;
        $batchData['questions'] = $questions;

        return response()->json([
            'success' => true,
            'data' => $batchData
        ], 200);
    }
}
