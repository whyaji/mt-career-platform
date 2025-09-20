<?php

namespace App\Exceptions;

use Laravel\Lumen\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Report or log an exception.
     */
    public function report(Throwable $e)
    {
        parent::report($e);
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $e)
    {
        // Debug logging
        if (config('app.debug')) {
            Log::info('Exception Handler Called', [
                'url' => $request->fullUrl(),
                'path' => $request->path(),
                'exception' => get_class($e),
                'message' => $e->getMessage(),
            ]);
        }

        // Check if this is an API request
        if ($this->isApiRequest($request)) {
            if (config('app.debug')) {
                Log::info('Handling as API request');
            }
            return $this->handleApiException($request, $e);
        }

        // Fallback: If the exception is an authentication or authorization error
        // and we're dealing with what looks like an API route, force JSON response
        if (($e instanceof AuthenticationException || $e instanceof AuthorizationException) &&
            $this->looksLikeApiRoute($request)
        ) {
            if (config('app.debug')) {
                Log::info('Forcing API response for auth exception');
            }
            return $this->handleApiException($request, $e);
        }

        if (config('app.debug')) {
            Log::info('Handling as web request');
        }
        return parent::render($request, $e);
    }

    /**
     * Check if the request looks like an API route even if not detected as one
     */
    private function looksLikeApiRoute(Request $request): bool
    {
        $path = $request->path();
        return str_contains($path, 'api/') ||
            str_contains($path, 'v1/ext') ||
            str_contains($path, 'login') ||
            str_contains($path, 'admin/') ||
            str_contains($path, 'talenthub/') ||
            str_contains($path, 'verification/') ||
            str_contains($path, 'batch/') ||
            str_contains($path, 'form/') ||
            $request->expectsJson() ||
            $request->ajax();
    }

    /**
     * Check if the request is an API request
     */
    private function isApiRequest(Request $request): bool
    {
        $path = $request->path();
        $url = $request->fullUrl();

        // Check if the URL contains /api/ anywhere in the path
        if (str_contains($path, 'api/') || str_contains($url, '/api/')) {
            return true;
        }

        // Check if the URL starts with /api/
        if ($request->is('api/*')) {
            return true;
        }

        // Check if the request expects JSON
        if ($request->expectsJson()) {
            return true;
        }

        // Check for JSON headers
        if (
            $request->header('Accept') === 'application/json' ||
            $request->header('Content-Type') === 'application/json'
        ) {
            return true;
        }

        // Check if it's a POST/PUT/PATCH request to API routes (common for API calls)
        if (
            in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE']) &&
            str_starts_with($path, 'api/')
        ) {
            return true;
        }

        // Force API mode for any request that looks like an API call
        if (str_contains($path, 'v1/ext') || str_contains($path, 'login') || str_contains($path, 'admin/')) {
            return true;
        }

        // Check for AJAX requests
        if ($request->ajax()) {
            return true;
        }

        // Check for API-like paths (including 404s on API routes)
        if (str_starts_with($path, 'api/') || str_contains($path, 'api/v1/')) {
            return true;
        }

        // Debug logging to see what's happening
        if (config('app.debug')) {
            Log::info('API Request Check', [
                'url' => $url,
                'path' => $path,
                'is_api' => $request->is('api/*'),
                'expects_json' => $request->expectsJson(),
                'accept_header' => $request->header('Accept'),
                'content_type' => $request->header('Content-Type'),
                'method' => $request->method(),
                'contains_api' => str_contains($path, 'api/'),
                'contains_v1_ext' => str_contains($path, 'v1/ext'),
                'is_ajax' => $request->ajax(),
            ]);
        }

        return false;
    }

    /**
     * Handle API exceptions and return JSON responses
     */
    private function handleApiException(Request $request, Throwable $e): JsonResponse
    {
        // Handle different types of exceptions
        if ($e instanceof ValidationException) {
            return $this->handleValidationException($e);
        }

        if ($e instanceof AuthenticationException) {
            return $this->handleAuthenticationException($e);
        }

        if ($e instanceof AuthorizationException) {
            return $this->handleAuthorizationException($e);
        }

        if ($e instanceof ModelNotFoundException) {
            return $this->handleModelNotFoundException($e);
        }

        if ($e instanceof NotFoundHttpException) {
            return $this->handleNotFoundHttpException($e);
        }

        if ($e instanceof MethodNotAllowedHttpException) {
            return $this->handleMethodNotAllowedHttpException($e);
        }

        if ($e instanceof TooManyRequestsHttpException) {
            return $this->handleTooManyRequestsHttpException($e);
        }

        if ($e instanceof TokenMismatchException) {
            return $this->handleTokenMismatchException($e);
        }

        if ($e instanceof HttpException) {
            return $this->handleHttpException($e);
        }

        // Handle general exceptions
        return $this->handleGeneralException($e, $request);
    }

    /**
     * Handle validation exceptions
     */
    private function handleValidationException(ValidationException $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors(),
            'status_code' => 422
        ], 422);
    }

    /**
     * Handle authentication exceptions
     */
    private function handleAuthenticationException(AuthenticationException $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Unauthenticated. Please provide a valid token.',
            'status_code' => 401
        ], 401);
    }

    /**
     * Handle authorization exceptions
     */
    private function handleAuthorizationException(AuthorizationException $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized. You do not have permission to perform this action.',
            'status_code' => 403
        ], 403);
    }

    /**
     * Handle model not found exceptions
     */
    private function handleModelNotFoundException(ModelNotFoundException $e): JsonResponse
    {
        $model = class_basename($e->getModel());
        return response()->json([
            'success' => false,
            'message' => "{$model} not found",
            'status_code' => 404
        ], 404);
    }

    /**
     * Handle not found HTTP exceptions
     */
    private function handleNotFoundHttpException(NotFoundHttpException $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'The requested resource was not found',
            'status_code' => 404
        ], 404);
    }

    /**
     * Handle method not allowed HTTP exceptions
     */
    private function handleMethodNotAllowedHttpException(MethodNotAllowedHttpException $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'The HTTP method is not allowed for this resource',
            'status_code' => 405
        ], 405);
    }

    /**
     * Handle too many requests HTTP exceptions
     */
    private function handleTooManyRequestsHttpException(TooManyRequestsHttpException $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Too many requests. Please try again later.',
            'status_code' => 429
        ], 429);
    }

    /**
     * Handle token mismatch exceptions
     */
    private function handleTokenMismatchException(TokenMismatchException $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Invalid or expired token',
            'status_code' => 419
        ], 419);
    }

    /**
     * Handle general HTTP exceptions
     */
    private function handleHttpException(HttpException $e): JsonResponse
    {
        $statusCode = $e->getStatusCode();
        $message = $e->getMessage() ?: 'An error occurred';

        return response()->json([
            'success' => false,
            'message' => $message,
            'status_code' => $statusCode
        ], $statusCode);
    }

    /**
     * Handle general exceptions
     */
    private function handleGeneralException(Throwable $e, Request $request): JsonResponse
    {
        $statusCode = 500;
        $message = 'Internal server error';

        // In debug mode, show more details
        if (config('app.debug')) {
            $message = $e->getMessage();
        }

        // Log the exception
        $this->logException($e, $request);

        return response()->json([
            'success' => false,
            'message' => $message,
            'status_code' => $statusCode,
            'debug' => config('app.debug') ? [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ] : null
        ], $statusCode);
    }

    /**
     * Log the exception
     */
    private function logException(Throwable $e, Request $request): void
    {
        Log::error('API Exception', [
            'exception' => get_class($e),
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
