<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use Illuminate\Http\Request;
use Carbon\Carbon;

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
}
