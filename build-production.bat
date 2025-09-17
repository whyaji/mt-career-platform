@echo off
echo Building MT Career Platform for Production...
echo.

echo Installing/updating frontend dependencies...
cd frontend
call npm install

echo.
echo Building frontend assets...
call npm run build:prod

echo.
echo Clearing PHP OPcache (if available)...
php -r "if (function_exists('opcache_reset')) { opcache_reset(); echo 'OPcache cleared!'; } else { echo 'OPcache not available'; }"

echo.
echo Production build complete!
echo Built assets are now in public/assets/ with cache-busting hashes
echo Asset manifest generated in public/manifest.json
echo You can now serve the application using your web server or php -S localhost:8000 -t public

cd ..
pause
