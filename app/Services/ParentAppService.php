<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class ParentAppService
{
    protected $baseUrl;
    protected $apiKey;
    protected $timeout;

    public function __construct()
    {
        $this->baseUrl = env('APP_PARENT_API_URL');
        $this->apiKey = env('APP_MT_CBICAREER_API_KEY');
        $this->timeout = 30; // seconds
    }

    /**
     * Get the base URL for the parent API
     */
    public function getBaseUrl()
    {
        return $this->baseUrl;
    }

    /**
     * Get the API key for authentication
     */
    public function getApiKey()
    {
        return $this->apiKey;
    }

    /**
     * Make HTTP request to parent API
     */
    protected function makeRequest($method, $endpoint, $data = [], $headers = [])
    {
        try {
            $url = rtrim($this->baseUrl, '/') . '/' . ltrim($endpoint, '/');

            $defaultHeaders = [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'x-api-key' => $this->apiKey,
            ];

            $headers = array_merge($defaultHeaders, $headers);

            Log::info('ParentAppService Request', [
                'method' => $method,
                'url' => $url,
                'headers' => $headers,
                'data' => $data
            ]);

            $response = Http::timeout($this->timeout)
                ->withHeaders($headers)
                ->$method($url, $data);

            Log::info('ParentAppService Response', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return $response;
        } catch (Exception $e) {
            Log::error('ParentAppService Request Failed', [
                'method' => $method,
                'endpoint' => $endpoint,
                'error' => $e->getMessage()
            ]);

            throw new Exception('Failed to communicate with parent API: ' . $e->getMessage());
        }
    }

    /**
     * Login to parent API
     */
    public function login($email, $password)
    {
        $data = [
            'email' => $email,
            'password' => $password,
        ];

        $response = $this->makeRequest('post', 'v1/ext/login', $data);

        if ($response->successful()) {
            return $response->json();
        }

        throw new Exception('Login failed: ' . $response->body());
    }

    /**
     * Refresh access token using refresh token
     */
    public function refreshToken($refreshToken, $accessToken)
    {
        $data = [
            'access_token' => $accessToken,
        ];

        $headers['Authorization'] = 'Bearer ' . $refreshToken;

        $response = $this->makeRequest('post', 'v1/ext/refresh-token', $data, $headers);

        if ($response->successful()) {
            return $response->json();
        }

        throw new Exception('Token refresh failed: ' . $response->body());
    }

    /**
     * Get admin profile from parent API
     */
    public function getUserProfile($accessToken)
    {
        $headers = [
            'Authorization' => 'Bearer ' . $accessToken,
        ];

        $response = $this->makeRequest('get', 'v1/ext/admin/profile', [], $headers);

        if ($response->successful()) {
            return $response->json();
        }

        throw new Exception('Failed to get user profile: ' . $response->body());
    }

    /**
     * Logout from parent API
     */
    public function adminLogout($accessToken, $refreshToken)
    {
        $data = [
            'refresh_token' => $refreshToken,
        ];

        $headers = [
            'Authorization' => 'Bearer ' . $accessToken,
        ];

        $response = $this->makeRequest('post', 'v1/ext/admin/logout', $data, $headers);

        if ($response->successful()) {
            return $response->json();
        }

        throw new Exception('Logout failed: ' . $response->body());
    }

    /**
     * Validate API configuration
     */
    public function validateConfiguration()
    {
        if (empty($this->baseUrl)) {
            throw new Exception('APP_PARENT_API_URL is not configured');
        }

        if (empty($this->apiKey)) {
            throw new Exception('APP_MT_CBICAREER_API_KEY is not configured');
        }

        return true;
    }

    /**
     * Test connection to parent API
     */
    public function testConnection()
    {
        try {
            $this->validateConfiguration();

            // Try to make a simple request to check if the API is reachable
            $response = Http::timeout(10)
                ->withHeaders([
                    'x-api-key' => $this->apiKey,
                    'Accept' => 'application/json',
                ])
                ->get(rtrim($this->baseUrl, '/') . '/v1/ext/admin/profile');

            return [
                'success' => true,
                'status' => $response->status(),
                'message' => 'Connection test completed'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Connection test failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Handle authentication errors
     */
    protected function handleAuthError($response)
    {
        $statusCode = $response->status();
        $body = $response->json();

        switch ($statusCode) {
            case 401:
                throw new Exception('Authentication failed: ' . ($body['message'] ?? 'Invalid credentials'));
            case 403:
                throw new Exception('Access forbidden: ' . ($body['message'] ?? 'Insufficient permissions'));
            case 404:
                throw new Exception('API endpoint not found');
            case 422:
                throw new Exception('Validation error: ' . ($body['message'] ?? 'Invalid request data'));
            case 500:
                throw new Exception('Internal server error: ' . ($body['message'] ?? 'Server error'));
            default:
                throw new Exception('API request failed with status ' . $statusCode . ': ' . $response->body());
        }
    }
}
