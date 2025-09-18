<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Services\TurnstileService;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class AuthController extends Controller
{
    protected $turnstileService;

    /**
     * Create a new AuthController instance.
     */
    public function __construct(TurnstileService $turnstileService)
    {
        $this->middleware('jwt.auth', ['except' => ['login']]);
        $this->turnstileService = $turnstileService;
    }

    /**
     * User login
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
            'turnstileToken' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $credentials = $validator->validated();

        // Get client IP
        $clientIP = $request->header('x-forwarded-for')
            ?? $request->header('x-real-ip')
            ?? $request->ip()
            ?? 'unknown';

        // Verify Turnstile token
        $turnstileValid = $this->turnstileService->verify($credentials['turnstileToken'], $clientIP);

        if (!$turnstileValid) {
            Log::warning("Turnstile verification failed from IP: {$clientIP}");
            return response()->json([
                'success' => false,
                'error' => 'TURNSTILE_FAILED',
                'message' => 'Security verification failed'
            ], 400);
        }

        $credentials = $request->only(['email', 'password']);

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        return $this->respondWithToken($token);
    }

    /**
     * Get authenticated user
     */
    public function me()
    {
        return response()->json([
            "success" => true,
            "message" => "User profile fetched successfully",
            "data" => auth('api')->user()
        ], 200);
    }

    /**
     * Logout user (invalidate token)
     */
    public function logout()
    {
        auth('api')->logout();

        return response()->json([
            "success" => true,
            "message" => "User logged out successfully",
            "data" => []
        ], 200);
    }

    /**
     * Get user profile with additional information
     */
    public function userProfile()
    {
        $user = auth('api')->user();

        return response()->json([
            "success" => true,
            "message" => "User profile fetched successfully",
            "data" => [
                'user' => $user,
                'token_payload' => auth('api')->payload()->toArray()
            ]
        ], 200);
    }

    /**
     * Refresh JWT token
     */
    public function refresh()
    {
        try {
            $token = auth('api')->refresh();
            return $this->respondWithToken($token);
        } catch (TokenInvalidException $e) {
            return response()->json([
                "success" => false,
                "error" => 'Token is invalid',
                "message" => 'Token is invalid'
            ], 401);
        } catch (JWTException $e) {
            return response()->json([
                "success" => false,
                "error" => 'Token cannot be refreshed',
                "message" => 'Token cannot be refreshed'
            ], 401);
        }
    }

    /**
     * Get token array structure
     */
    protected function respondWithToken(string $token)
    {
        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => auth('api')->user(),
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60
            ]
        ], 200);
    }
}
