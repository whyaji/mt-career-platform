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
        $router->post('/refresh', 'AuthController@refresh');
    });

    // Protected auth routes
    $router->group(['prefix' => 'auth', 'middleware' => 'jwt.auth'], function () use ($router) {
        $router->get('/me', 'AuthController@me');
        $router->post('/logout', 'AuthController@logout');
        $router->get('/user-profile', 'AuthController@userProfile');
    });

    // Admin routes
    $router->group(['prefix' => 'talenthub', 'middleware' => 'jwt.auth'], function () use ($router) {
        $router->group(['prefix' => 'dashboard'], function () use ($router) {
            $router->get('/', function () {
                return response()->json(['message' => 'Admin dashboard accessed']);
            });
            $router->get('/counts', 'DashboardController@getCounts');
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
        $router->get('/{id}', 'BatchController@getBatchById');
        $router->post('/', 'BatchController@createBatch');
        $router->put('/{id}', 'BatchController@updateBatch');
        $router->delete('/{id}', 'BatchController@deleteBatch');
    });

    // Educational Institution routes with rate limiting for active endpoint
    $router->group(['prefix' => 'educational-institution', 'middleware' => 'rate_limit:60,1'], function () use ($router) {
        $router->get('/active', 'EducationalInstitutionController@getActive');
    });

    // Educational Institution routes with JWT auth
    $router->group(['prefix' => 'educational-institution', 'middleware' => 'jwt.auth'], function () use ($router) {
        $router->get('/', 'EducationalInstitutionController@getInstitutions');
        $router->get('/{id}', 'EducationalInstitutionController@getInstitutionById');
        $router->post('/', 'EducationalInstitutionController@createInstitution');
        $router->put('/{id}', 'EducationalInstitutionController@updateInstitution');
        $router->delete('/{id}', 'EducationalInstitutionController@deleteInstitution');
    });

    // Application routes with JWT auth
    $router->group(['prefix' => 'applications', 'middleware' => 'jwt.auth'], function () use ($router) {
        $router->get('/', 'ApplicantDataController@getApplications');
        $router->get('/{id}', 'ApplicantDataController@getApplicationById');
        $router->put('/{id}', 'ApplicantDataController@updateApplication');
        $router->delete('/{id}', 'ApplicantDataController@deleteApplication');
    });

    // Form routes with stricter rate limiting
    $router->group(['prefix' => 'form', 'middleware' => 'rate_limit:5,1'], function () use ($router) {
        $router->post('/', 'FormController@submit');
    });
});
