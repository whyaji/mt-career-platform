<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Services\TurnstileService;

class AuthController extends Controller
{
    protected $turnstileService;
    /**
     * Create a new AuthController instance.
     */
    public function __construct(TurnstileService $turnstileService)
    {
        $this->middleware('auth:api', ['except' => ['login', 'register']]);
        $this->turnstileService = $turnstileService;
    }

    /**
     * Get a JWT via given credentials.
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

        // Find user by email
        $user = User::where('email', $credentials['email'])->first();

        // Check if user exists and password is correct
        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Generate JWT token
        try {
            $token = JWTAuth::fromUser($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 500);
        }

        return $this->createNewToken($token, $user);
    }

    /**
     * Log the user out (Invalidate the token).
     */
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['message' => 'User successfully signed out']);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Token invalid'], 401);
        }
    }

    /**
     * Refresh a token.
     */
    public function refresh()
    {
        try {
            $newToken = JWTAuth::refresh(JWTAuth::getToken());
            $user = JWTAuth::parseToken()->authenticate();
            return $this->createNewToken($newToken, $user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Token refresh failed'], 401);
        }
    }

    /**
     * Get the authenticated User.
     */
    public function userProfile()
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            return response()->json($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Token invalid'], 401);
        }
    }

    /**
     * Get the token array structure.
     */
    protected function createNewToken($token, $user = null)
    {
        return response()->json([
            "success" => true,
            "data" => [
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60,
                'user' => $user
            ]
        ]);
    }
}
