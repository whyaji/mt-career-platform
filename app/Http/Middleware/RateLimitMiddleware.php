<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RateLimitMiddleware
{
    private $maxAttempts;
    private $decayMinutes;

    public function __construct($maxAttempts = 60, $decayMinutes = 1)
    {
        $this->maxAttempts = $maxAttempts;
        $this->decayMinutes = $decayMinutes;
    }

    public function handle(Request $request, Closure $next, $maxAttempts = null, $decayMinutes = null)
    {
        $maxAttempts = $maxAttempts ?? $this->maxAttempts;
        $decayMinutes = $decayMinutes ?? $this->decayMinutes;
        
        $key = $this->resolveRequestSignature($request);
        $attempts = Cache::get($key, 0);
        
        if ($attempts >= $maxAttempts) {
            Log::warning("Rate limit exceeded for key: {$key}");
            return response()->json([
                'error' => 'RATE_LIMIT_EXCEEDED',
                'message' => 'Too many requests'
            ], 429);
        }
        
        Cache::put($key, $attempts + 1, Carbon::now()->addMinutes($decayMinutes));
        
        $response = $next($request);
        
        // Add rate limit headers
        $response->headers->set('X-RateLimit-Limit', $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', max(0, $maxAttempts - $attempts - 1));
        
        return $response;
    }

    protected function resolveRequestSignature(Request $request): string
    {
        $clientIP = $request->header('x-forwarded-for') 
            ?? $request->header('x-real-ip') 
            ?? $request->ip() 
            ?? 'unknown';
            
        return 'rate_limit:' . sha1($clientIP . '|' . $request->getPathInfo());
    }
}
