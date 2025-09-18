<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CorsMiddleware
{
    private array $config;

    public function __construct()
    {
        $this->config = [
            'allowed_origins' => $this->getAllowedOrigins(),
            'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            'allowed_headers' => [
                'Content-Type',
                'Authorization',
                'X-Requested-With',
                'Accept',
                'Origin',
                'X-CSRF-Token'
            ],
            'exposed_headers' => [
                'X-RateLimit-Limit',
                'X-RateLimit-Remaining'
            ],
            'max_age' => 86400,
            'supports_credentials' => true,
        ];
    }

    public function handle(Request $request, Closure $next)
    {
        $origin = $request->headers->get('Origin');
        $allowedOrigin = $this->determineAllowedOrigin($origin);

        // Handle preflight requests
        if ($request->getMethod() === 'OPTIONS') {
            return $this->handlePreflightRequest($allowedOrigin);
        }

        $response = $next($request);

        // Add CORS headers to actual requests
        return $this->addCorsHeaders($response, $allowedOrigin);
    }

    /**
     * Get allowed origins based on environment
     */
    private function getAllowedOrigins(): array
    {
        $origins = [];

        // Add production frontend URL
        if ($frontendUrl = env('FE_URL')) {
            $origins[] = $frontendUrl;
        }

        // Add development origins
        if (env('APP_ENV') === 'local') {
            $origins = array_merge($origins, [
                'http://localhost:5193',
                'http://localhost:8000',
                'http://127.0.0.1:5193',
                'http://127.0.0.1:8000',
                'http://localhost:3000', // React
                'http://localhost:8080', // Vue
                'http://localhost:4200', // Angular
            ]);
        }

        return array_unique(array_filter($origins));
    }

    /**
     * Determine if origin is allowed
     */
    private function determineAllowedOrigin(?string $origin): ?string
    {
        // No origin header (same-origin requests)
        if (!$origin) {
            return '*';
        }

        // Check exact match
        if (in_array($origin, $this->config['allowed_origins'])) {
            return $origin;
        }

        // Development mode - allow localhost variations
        if (env('APP_ENV') === 'local' && $this->isLocalhost($origin)) {
            return $origin;
        }

        // Log rejected origins in development
        if (env('APP_ENV') === 'local') {
            Log::warning('CORS: Origin not allowed', [
                'origin' => $origin,
                'allowed_origins' => $this->config['allowed_origins']
            ]);
        }

        return null;
    }

    /**
     * Check if origin is localhost variant
     */
    private function isLocalhost(string $origin): bool
    {
        return preg_match('/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin);
    }

    /**
     * Handle preflight OPTIONS request
     */
    private function handlePreflightRequest(?string $allowedOrigin): \Illuminate\Http\Response
    {
        if (!$allowedOrigin) {
            return response('CORS Error: Origin not allowed', 403);
        }

        return response('', 200, [
            'Access-Control-Allow-Origin' => $allowedOrigin,
            'Access-Control-Allow-Methods' => implode(', ', $this->config['allowed_methods']),
            'Access-Control-Allow-Headers' => implode(', ', $this->config['allowed_headers']),
            'Access-Control-Allow-Credentials' => $this->config['supports_credentials'] ? 'true' : 'false',
            'Access-Control-Max-Age' => (string) $this->config['max_age'],
        ]);
    }

    /**
     * Add CORS headers to response
     */
    private function addCorsHeaders($response, ?string $allowedOrigin)
    {
        if (!$allowedOrigin) {
            return $response;
        }

        $response->headers->set('Access-Control-Allow-Origin', $allowedOrigin);

        if ($this->config['supports_credentials']) {
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }

        if (!empty($this->config['exposed_headers'])) {
            $response->headers->set(
                'Access-Control-Expose-Headers',
                implode(', ', $this->config['exposed_headers'])
            );
        }

        return $response;
    }
}
