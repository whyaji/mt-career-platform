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


// Serve static files (uploads)
$router->get('/uploads/{filename:.*}', function ($filename) {
    $path = storage_path('app/public/uploads/' . $filename);

    if (!file_exists($path)) {
        abort(404);
    }

    return response()->file($path);
});

// Catch-all route for React Router (must be last)
// Exclude API routes from the catch-all
$router->get('/{any:.*}', function ($any) use ($router) {
    // If it's an API route, let it fall through to 404 handling
    if (str_starts_with($any, 'api/')) {
        abort(404);
    }
    return view('app');
});
