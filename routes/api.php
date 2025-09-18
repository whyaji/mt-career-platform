<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the API routes for an application.
| These routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

// API info route
$router->get('/api', function () use ($router) {
    return $router->app->version();
});

// API Routes with versioning
$router->group(['prefix' => 'api/v1', 'middleware' => ['security']], function () use ($router) {

    // Auth routes
    $router->group(['prefix' => 'auth'], function () use ($router) {
        $router->post('/login', 'AuthController@login');
    });

    // Protected auth routes
    $router->group(['prefix' => 'auth', 'middleware' => 'jwt.auth'], function () use ($router) {
        $router->get('/me', 'AuthController@me');
        $router->post('/logout', 'AuthController@logout');
        $router->post('/refresh', 'AuthController@refresh');
        $router->get('/user-profile', 'AuthController@userProfile');
    });

    // Admin routes
    $router->group(['prefix' => 'talenthub', 'middleware' => 'jwt.auth'], function () use ($router) {
        $router->get('/dashboard', function () {
            return response()->json(['message' => 'Admin dashboard accessed']);
        });
    });

    // Verification routes
    $router->group(['prefix' => 'verification'], function () use ($router) {
        $router->get('/path/{batchLocation}/{batchNumber}', 'VerificationController@path');
    });

    // Batch routes with rate limiting
    $router->group(['prefix' => 'batch', 'middleware' => 'rate_limit:60,1'], function () use ($router) {
        $router->get('/active', 'BatchController@getActive');
    });

    // Batch routes with JWT auth
    $router->group(['prefix' => 'batch', 'middleware' => 'jwt.auth'], function () use ($router) {
        $router->get('/', 'BatchController@getBatches');
    });

    // Form routes with stricter rate limiting
    $router->group(['prefix' => 'form', 'middleware' => 'rate_limit:5,1'], function () use ($router) {
        $router->post('/', 'FormController@submit');
    });
});
