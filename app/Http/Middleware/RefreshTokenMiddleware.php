<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\JWTException;

class RefreshTokenMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        try {
            // Check if the token is valid
            if (!JWTAuth::parseToken()->authenticate()) {
                return response()->json(['error' => 'User not found'], 404);
            }
        } catch (TokenExpiredException $e) {
            try {
                // Attempt to refresh the token
                $newToken = JWTAuth::refresh();
                // Set the new token in the response header
                return $next($request)->header('Authorization', 'Bearer ' . $newToken);
            } catch (JWTException $e) {
                return response()->json(['error' => 'Token cannot be refreshed'], 401);
            }
        } catch (JWTException $e) {
            return response()->json(['error' => 'Token is invalid'], 401);
        }

        return $next($request);
    }
}
