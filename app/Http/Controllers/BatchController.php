<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BatchController extends Controller
{
    public function getActive(Request $request)
    {
        try {
            $batches = Batch::active()
                ->select('id', 'number', 'number_code', 'location', 'location_code', 'year')
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
}
