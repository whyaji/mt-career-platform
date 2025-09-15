<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SecurityMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Add security headers
        $response = $next($request);
        
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        
        // Content Security Policy
        $csp = "default-src 'self'; " .
               "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; " .
               "style-src 'self' 'unsafe-inline'; " .
               "img-src 'self' data: https:; " .
               "font-src 'self'; " .
               "connect-src 'self' https://challenges.cloudflare.com; " .
               "frame-src https://challenges.cloudflare.com;";
        
        $response->headers->set('Content-Security-Policy', $csp);
        
        return $response;
    }
}
