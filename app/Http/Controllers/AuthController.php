<?php

namespace App\Http\Controllers;

use App\Services\ParentAppService;
use App\Models\User;
use App\Models\UserRefreshToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Services\TurnstileService;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Carbon\Carbon;

class AuthController extends Controller
{
    protected $turnstileService;
    protected $parentAppService;

    /**
     * Create a new AuthController instance.
     */
    public function __construct(TurnstileService $turnstileService, ParentAppService $parentAppService)
    {
        $this->middleware('jwt.auth', ['except' => ['login', 'refresh']]);
        $this->turnstileService = $turnstileService;
        $this->parentAppService = $parentAppService;
    }

    /**
     * Parent API Login
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if (env('APP_ENV') !== 'local') {
            $validator->addRules(['turnstileToken' => 'required|string']);
        }

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'VALIDATION_ERROR',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $validator->validated();

        // Get client IP
        $clientIP = $request->header('x-forwarded-for')
            ?? $request->header('x-real-ip')
            ?? $request->ip()
            ?? 'unknown';

        if (env('APP_ENV') !== 'local') {
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
        }

        try {
            // Authenticate with parent API
            $parentResponse = $this->parentAppService->login($credentials['email'], $credentials['password']);

            if (!$parentResponse['success']) {
                return response()->json([
                    'success' => false,
                    'error' => 'PARENT_AUTH_FAILED',
                    'message' => $parentResponse['message'] ?? 'Authentication failed'
                ], 401);
            }

            $parentData = $parentResponse['data'];
            $parentAdmin = $parentData['admin'];
            $parentTokens = $parentData['tokens'];

            // Create or update local user
            $user = User::updateOrCreate(
                ['email' => $parentAdmin['email']],
                [
                    'name' => $parentAdmin['name'],
                    'password' => Hash::make($credentials['password']), // Hash the password for local storage
                    'email_verified_at' => $parentAdmin['account_verified_at'] ? Carbon::parse($parentAdmin['account_verified_at']) : null,
                ]
            );

            // Generate JWT token with parent API tokens in payload
            $customClaims = [
                'parent_access_token' => $parentTokens['access_token']['token'],
                'parent_refresh_token' => $parentTokens['refresh_token']['token'],
                'parent_access_expires_at' => $parentTokens['access_token']['expires_at'],
                'parent_refresh_expires_at' => $parentTokens['refresh_token']['expires_at'],
            ];

            Log::info('Generating JWT with custom claims', $customClaims);

            // Set custom claims before creating the token
            JWTAuth::customClaims($customClaims);
            $jwtToken = JWTAuth::fromUser($user);

            // Decode the token to verify claims were added
            $decoded = JWTAuth::setToken($jwtToken)->getPayload()->toArray();
            Log::info('JWT payload after generation', $decoded);

            $refreshTokenParentData = [
                'parent_access_token' => $parentTokens['access_token']['token'],
                'parent_refresh_token' => $parentTokens['refresh_token']['token'],
            ];

            return $this->respondWithToken($jwtToken, $user, $refreshTokenParentData, $request->userAgent());
        } catch (\Exception $e) {
            Log::error('Parent login failed', [
                'email' => $credentials['email'],
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'PARENT_API_ERROR',
                'message' => 'Failed to authenticate with parent service'
            ], 500);
        }
    }

    /**
     * Parent API Token Refresh
     */
    public function refresh(Request $request)
    {
        try {
            $refreshToken = $request->header('Authorization');
            $refreshToken = Str::replace('Bearer ', '', $refreshToken);
            $refreshToken = explode('|', $refreshToken);
            $refreshTokenString = $refreshToken[1];
            $refreshTokenId = $refreshToken[0];
            $refreshToken = UserRefreshToken::where('id', $refreshTokenId)->first();

            if (!$refreshToken) {
                return response()->json([
                    'success' => false,
                    'error' => 'NO_REFRESH_TOKEN',
                    'message' => 'No refresh token found'
                ], 400);
            }

            if ($refreshToken->isExpired()) {
                $refreshToken->delete();
                return response()->json([
                    'success' => false,
                    'error' => 'EXPIRED_REFRESH_TOKEN',
                    'message' => 'Refresh token expired'
                ], 400);
            }

            if (!Hash::check($refreshTokenString, $refreshToken->refresh_token)) {
                return response()->json([
                    'success' => false,
                    'error' => 'INVALID_REFRESH_TOKEN',
                    'message' => 'Invalid refresh token'
                ], 400);
            }

            $payload = $refreshToken->parent_tokens;

            // Check if we have parent tokens in the JWT payload
            if (!isset($payload['parent_refresh_token'])) {
                return response()->json([
                    'success' => false,
                    'error' => 'NO_PARENT_TOKEN',
                    'message' => 'No parent refresh token found'
                ], 400);
            }

            // Refresh parent API token
            $parentResponse = $this->parentAppService->refreshToken(
                $payload['parent_refresh_token'],
                $payload['parent_access_token']
            );

            if (!$parentResponse['success']) {
                return response()->json([
                    'success' => false,
                    'error' => 'PARENT_REFRESH_FAILED',
                    'message' => $parentResponse['message'] ?? 'Token refresh failed'
                ], 401);
            }

            $parentTokens = $parentResponse['data']['tokens'];

            // Generate new JWT with updated parent tokens
            $user = $refreshToken->user;
            $newCustomClaims = [
                'parent_access_token' => $parentTokens['access_token']['token'],
                'parent_refresh_token' => $parentTokens['refresh_token']['token'],
                'parent_access_expires_at' => $parentTokens['access_token']['expires_at'],
                'parent_refresh_expires_at' => $parentTokens['refresh_token']['expires_at'],
            ];

            JWTAuth::customClaims($newCustomClaims);
            $newJwtToken = JWTAuth::fromUser($user);

            $refreshTokenParentData = [
                'parent_access_token' => $parentTokens['access_token']['token'],
                'parent_refresh_token' => $parentTokens['refresh_token']['token'],
            ];

            $refreshToken->delete();

            return $this->respondWithToken($newJwtToken, $user, $refreshTokenParentData, $request->userAgent());
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'error' => 'JWT_ERROR',
                'message' => 'Invalid token'
            ], 401);
        } catch (\Exception $e) {
            Log::error('Parent token refresh failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'REFRESH_ERROR',
                'message' => 'Failed to refresh token'
            ], 500);
        }
    }

    /**
     * Parent API Logout
     */
    public function logout(Request $request)
    {
        try {
            $token = JWTAuth::getToken();
            $payload = JWTAuth::getPayload($token)->toArray();

            // Check if we have parent access token
            if (isset($payload['parent_access_token'])) {
                // Logout from parent API
                $this->parentAppService->adminLogout($payload['parent_access_token'], $payload['parent_refresh_token']);
            }

            // Logout from local JWT
            auth('api')->logout();

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully from both local and parent services'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Parent logout failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Even if parent logout fails, we should still logout locally
            auth('api')->logout();

            return response()->json([
                'success' => true,
                'message' => 'Logged out locally (parent logout may have failed)'
            ], 200);
        }
    }

    /**
     * Get parent admin profile
     */
    public function userProfile(Request $request)
    {
        try {
            $token = JWTAuth::getToken();
            $payload = JWTAuth::getPayload($token)->toArray();

            Log::info('UserProfile - JWT payload', $payload);

            if (!isset($payload['parent_access_token'])) {
                return response()->json([
                    'success' => false,
                    'error' => 'NO_PARENT_TOKEN',
                    'message' => 'No parent access token found',
                ], 400);
            }

            // Get profile from parent API
            $parentResponse = $this->parentAppService->getUserProfile($payload['parent_access_token']);

            if (!$parentResponse['success']) {
                return response()->json([
                    'success' => false,
                    'error' => 'PARENT_PROFILE_FAILED',
                    'message' => $parentResponse['message'] ?? 'Failed to get profile'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'message' => 'Profile retrieved successfully',
                'data' => [
                    'local_user' => auth('api')->user(),
                    'parent_admin' => $parentResponse['data']['admin'],
                    'parent_service' => $parentResponse['data']['service']
                ]
            ], 200);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'error' => 'JWT_ERROR',
                'message' => 'Invalid token'
            ], 401);
        } catch (\Exception $e) {
            Log::error('Parent profile fetch failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'PROFILE_ERROR',
                'message' => 'Failed to get profile'
            ], 500);
        }
    }

    /**
     * Get token array structure for parent authentication
     */
    protected function respondWithToken(string $token, User $user, array $refreshTokenParentData, string $userAgent)
    {
        $now = Carbon::now();
        $accessTokenExpiry = $now->copy()->addMinutes(config('jwt.ttl'));
        $refreshTokenExpiry = $now->copy()->addMinutes(env('USER_REFRESH_TTL'));

        $refreshTokenString = Str::random(255);
        $refreshTokenHash = Hash::make($refreshTokenString);

        $refreshToken = UserRefreshToken::create([
            'user_id' => $user->id,
            'refresh_token' => $refreshTokenHash,
            'expires_at' => $refreshTokenExpiry,
            'parent_tokens' => $refreshTokenParentData,
            'user_agent' => $userAgent
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Parent authentication successful',
            'data' => [
                'user' => $user,
                'tokens' => [
                    'access_token' => [
                        'token' => $token,
                        'expires_at' => $accessTokenExpiry->toISOString(),
                        'token_type' => 'Bearer'
                    ],
                    'refresh_token' => [
                        'token' => $refreshToken->id . '|' . $refreshTokenString,
                        'expires_at' => $refreshTokenExpiry->toISOString(),
                        'token_type' => 'Bearer'
                    ]
                ]
            ]
        ], 200);
    }
}
