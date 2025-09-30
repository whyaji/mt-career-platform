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
            $router->get('/{id}/with-questions', 'BatchController@getBatchByIdWithQuestions');
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

        // Program Category routes with JWT auth
        $router->group(['prefix' => 'program-category'], function () use ($router) {
            $router->get('/active', 'ProgramCategoryController@getActive');
            $router->get('/', 'ProgramCategoryController@getProgramCategories');
            $router->get('/{id}', 'ProgramCategoryController@getProgramCategoryById');
            $router->post('/', 'ProgramCategoryController@createProgramCategory');
            $router->put('/{id}', 'ProgramCategoryController@updateProgramCategory');
            $router->delete('/{id}', 'ProgramCategoryController@deleteProgramCategory');
        });

        // Program routes with JWT auth
        $router->group(['prefix' => 'program'], function () use ($router) {
            $router->get('/active', 'ProgramController@getActive');
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
            $router->get('/{batchId}/questions-list/available', 'BatchQuestionController@getAvailableQuestionsForBatch');
            $router->post('/{batchId}/questions-list/bulk-operations', 'BatchQuestionController@bulkBatchQuestionOperations');
            $router->get('/{batchId}/form-configuration', 'BatchQuestionController@getBatchFormConfiguration');
        });

        // Open Program routes with JWT auth
        $router->group(['prefix' => 'open-program'], function () use ($router) {
            $router->get('/', 'OpenProgramController@getOpenPrograms');
        });

        // Global Generated Files routes with JWT auth
        $router->group(['prefix' => 'generated-files'], function () use ($router) {
            $router->post('/list', 'GlobalGeneratedFileController@getGeneratedFiles');
            $router->post('/status', 'GlobalGeneratedFileController@getGeneratedFilesStatus');
            $router->post('/download', 'GlobalGeneratedFileController@downloadGeneratedFiles');
            $router->post('/stats', 'GlobalGeneratedFileController@getGeneratedFilesStats');
            $router->delete('/', 'GlobalGeneratedFileController@deleteGeneratedFiles');
        });

        // Screening Applicant routes with JWT auth
        $router->group(['prefix' => 'screening-applicant'], function () use ($router) {
            $router->get('/', 'ScreeningApplicantController@getScreeningApplicants');
            $router->get('/stats', 'ScreeningApplicantController@getScreeningApplicantStats');
            $router->get('/status/{status}', 'ScreeningApplicantController@getScreeningApplicantsByStatus');
            $router->get('/batch/{batchId}', 'ScreeningApplicantController@getScreeningApplicantsByBatch');
            $router->get('/{id}', 'ScreeningApplicantController@getScreeningApplicantById');
            $router->post('/', 'ScreeningApplicantController@createScreeningApplicant');
            $router->put('/{id}', 'ScreeningApplicantController@updateScreeningApplicant');
            $router->put('/{id}/status', 'ScreeningApplicantController@updateScreeningApplicantStatus');
            $router->delete('/{id}', 'ScreeningApplicantController@deleteScreeningApplicant');
            $router->put('/{id}/marking', 'ScreeningApplicantController@markingScreeningApplicant');

            // Excel generation routes
            $router->post('/batch/{batchId}/generate-excel', 'ScreeningApplicantController@generateExcelByBatch');
            $router->get('/batch/{batchId}/generated-files', 'ScreeningApplicantController@getGeneratedFilesByBatch');
            $router->get('/generated-file/{generatedFileId}/status', 'ScreeningApplicantController@getGeneratedFileStatus');
            $router->get('/generated-file/{generatedFileId}/download', 'ScreeningApplicantController@downloadGeneratedFile');
        });
    });

    // Verification routes
    $router->group(['prefix' => 'verification'], function () use ($router) {
        $router->get('/path/{batchLocation}/{batchNumber}', 'VerificationController@path');
        $router->get('/form-path/{programCategoryCode}/{batchLocationCode}/{batchNumberCode}', 'VerificationController@formPath');
    });

    // Batch routes with rate limiting
    $router->group(['prefix' => 'batch', 'middleware' => 'rate_limit:60,1'], function () use ($router) {
        $router->get('/active', 'BatchController@getActive');
    });

    // Form routes with stricter rate limiting
    $router->group(['prefix' => 'form', 'middleware' => 'rate_limit:5,1'], function () use ($router) {
        $router->post('/', 'FormController@submit');
        $router->post('/submit', 'FormController@formSubmit');
    });
});
