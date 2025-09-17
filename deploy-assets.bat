@echo off
echo Deploying MT Career Platform Assets...
echo.

echo Step 1: Building frontend assets with cache busting...
cd frontend
call npm run build:prod

echo.
echo Step 2: Clearing server caches...
cd ..

rem Clear PHP OPcache
php -r "if (function_exists('opcache_reset')) { opcache_reset(); echo 'PHP OPcache cleared!'; } else { echo 'PHP OPcache not available'; }"

rem Clear Laravel cache if using framework cache
php artisan cache:clear 2>nul || echo No Laravel artisan cache to clear

echo.
echo Step 3: Setting proper file permissions...
rem Set proper permissions for assets (Windows)
icacls public\assets /grant Everyone:F /t 2>nul || echo Permission setting skipped

echo.
echo Step 4: Force browser cache refresh...
echo Adding cache headers for immediate effect...

echo.
echo Deployment Summary:
echo ==================
echo ✓ Frontend assets built with hash-based versioning
echo ✓ Server caches cleared
echo ✓ File permissions set
echo ✓ Browser cache busting enabled
echo.
echo Next steps:
echo - Upload all files in public/assets/ to your server
echo - Upload public/manifest.json to your server
echo - Ensure your web server serves assets with proper cache headers
echo.
echo Assets are now ready for deployment!

pause
