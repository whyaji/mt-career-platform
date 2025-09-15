<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

// Serve the React app
$router->get('/', function () use ($router) {
    return view('app');
});

// API info route
$router->get('/api', function () use ($router) {
    return $router->app->version();
});

// API Routes with versioning
$router->group(['prefix' => 'api/v1', 'middleware' => ['security']], function () use ($router) {
    
    // Verification routes
    $router->group(['prefix' => 'verification'], function () use ($router) {
        $router->get('/path/{batchLocation}/{batchNumber}', 'VerificationController@path');
    });
    
    // Batch routes with rate limiting
    $router->group(['prefix' => 'batch', 'middleware' => 'rate_limit:60,1'], function () use ($router) {
        $router->get('/active', 'BatchController@getActive');
    });
    
    // Form routes with stricter rate limiting
    $router->group(['prefix' => 'form', 'middleware' => 'rate_limit:5,1'], function () use ($router) {
        $router->post('/', 'FormController@submit');
    });
});

// Serve static files (uploads)
$router->get('/uploads/{filename:.*}', function ($filename) {
    $path = storage_path('app/public/uploads/' . $filename);
    
    if (!file_exists($path)) {
        abort(404);
    }
    
    return response()->file($path);
});

// Catch-all route for React Router (must be last)
$router->get('/{any:.*}', function () use ($router) {
    return view('app');
});
