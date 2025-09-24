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
    $router->group(['prefix' => 'talenthub/auth'], function () use ($router) {
        $router->post('/login', 'AuthController@login');
        $router->post('/refresh', 'AuthController@refresh');
    });

    // Protected auth routes
    $router->group(['prefix' => 'talenthub/auth', 'middleware' => 'jwt.auth'], function () use ($router) {
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

        // Batch routes with JWT auth
        $router->group(['prefix' => 'batch'], function () use ($router) {
            $router->get('/', 'BatchController@getBatches');
            $router->get('/{id}', 'BatchController@getBatchById');
            $router->post('/', 'BatchController@createBatch');
            $router->put('/{id}', 'BatchController@updateBatch');
            $router->delete('/{id}', 'BatchController@deleteBatch');
        });

        // Educational Institution routes with rate limiting for active endpoint
        $router->group(['prefix' => 'educational-institution'], function () use ($router) {
            $router->get('/active', 'EducationalInstitutionController@getActive');
        });

        // Educational Institution routes with JWT auth
        $router->group(['prefix' => 'educational-institution'], function () use ($router) {
            $router->get('/', 'EducationalInstitutionController@getInstitutions');
            $router->get('/{id}', 'EducationalInstitutionController@getInstitutionById');
            $router->post('/', 'EducationalInstitutionController@createInstitution');
            $router->put('/{id}', 'EducationalInstitutionController@updateInstitution');
            $router->delete('/{id}', 'EducationalInstitutionController@deleteInstitution');
        });

        // Program Category routes with rate limiting for active endpoint
        $router->group(['prefix' => 'program-category'], function () use ($router) {
            $router->get('/active', 'ProgramCategoryController@getActive');
        });

        // Program Category routes with JWT auth
        $router->group(['prefix' => 'program-category'], function () use ($router) {
            $router->get('/', 'ProgramCategoryController@getProgramCategories');
            $router->get('/{id}', 'ProgramCategoryController@getProgramCategoryById');
            $router->post('/', 'ProgramCategoryController@createProgramCategory');
            $router->put('/{id}', 'ProgramCategoryController@updateProgramCategory');
            $router->delete('/{id}', 'ProgramCategoryController@deleteProgramCategory');
        });

        // Program routes with rate limiting for active endpoint
        $router->group(['prefix' => 'program'], function () use ($router) {
            $router->get('/active', 'ProgramController@getActive');
        });

        // Program routes with JWT auth
        $router->group(['prefix' => 'program'], function () use ($router) {
            $router->get('/', 'ProgramController@getPrograms');
            $router->get('/{id}', 'ProgramController@getProgramById');
            $router->post('/', 'ProgramController@createProgram');
            $router->put('/{id}', 'ProgramController@updateProgram');
            $router->delete('/{id}', 'ProgramController@deleteProgram');
        });

        // Application routes with JWT auth
        $router->group(['prefix' => 'applications'], function () use ($router) {
            $router->get('/', 'ApplicantDataController@getApplications');
            $router->get('/{id}', 'ApplicantDataController@getApplicationById');
            $router->put('/{id}', 'ApplicantDataController@updateApplication');
            $router->delete('/{id}', 'ApplicantDataController@deleteApplication');
        });

        // Question routes with rate limiting for active endpoint
        $router->group(['prefix' => 'question'], function () use ($router) {
            $router->get('/active', 'QuestionController@getActive');
            $router->get('/types', 'QuestionController@getQuestionTypes');
            $router->get('/validation-rules', 'QuestionController@getValidationRules');
            $router->get('/common-validation-rules', 'QuestionController@getCommonValidationRules');
            $router->get('/icons', 'QuestionController@getIcons');
            $router->get('/group/{group}', 'QuestionController@getQuestionsByGroup');
        });

        // Question routes with JWT auth
        $router->group(['prefix' => 'question'], function () use ($router) {
            $router->get('/', 'QuestionController@getQuestions');
            $router->get('/{id}', 'QuestionController@getQuestionById');
            $router->get('/code/{code}', 'QuestionController@getQuestionByCode');
            $router->post('/', 'QuestionController@createQuestion');
            $router->put('/{id}', 'QuestionController@updateQuestion');
            $router->delete('/{id}', 'QuestionController@deleteQuestion');
            $router->post('/{id}/duplicate', 'QuestionController@duplicateQuestion');
        });

        // Batch Question routes with JWT auth
        $router->group(['prefix' => 'batch'], function () use ($router) {
            $router->get('/{batchId}/questions', 'BatchQuestionController@getBatchQuestions');
            $router->get('/{batchId}/questions/{questionId}', 'BatchQuestionController@getBatchQuestionById');
            $router->post('/{batchId}/questions', 'BatchQuestionController@assignQuestionToBatch');
            $router->put('/{batchId}/questions/{questionId}', 'BatchQuestionController@updateBatchQuestion');
            $router->delete('/{batchId}/questions/{questionId}', 'BatchQuestionController@removeQuestionFromBatch');
            $router->post('/{batchId}/questions-list/reorder', 'BatchQuestionController@reorderBatchQuestions');
            $router->get('/{batchId}/questions-list/available', 'BatchQuestionController@getAvailableQuestionsForBatch');
            $router->post('/{batchId}/questions-list/bulk-assign', 'BatchQuestionController@bulkAssignQuestions');
            $router->post('/{batchId}/questions-list/bulk-operations', 'BatchQuestionController@bulkBatchQuestionOperations');
            $router->get('/{batchId}/form-configuration', 'BatchQuestionController@getBatchFormConfiguration');
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

    // Form routes with stricter rate limiting
    $router->group(['prefix' => 'form', 'middleware' => 'rate_limit:5,1'], function () use ($router) {
        $router->post('/', 'FormController@submit');
    });
});
