<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class JWTMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'error' => 'USER_NOT_FOUND',
                    'message' => 'User not found'
                ], 404);
            }

        } catch (TokenExpiredException $e) {
            return response()->json([
                'success' => false,
                'error' => 'TOKEN_EXPIRED',
                'message' => 'Token has expired'
            ], 401);

        } catch (TokenInvalidException $e) {
            return response()->json([
                'success' => false,
                'error' => 'TOKEN_INVALID',
                'message' => 'Token is invalid'
            ], 401);

        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'error' => 'TOKEN_REQUIRED',
                'message' => 'Token is required'
            ], 401);
        }

        return $next($request);
    }
}
