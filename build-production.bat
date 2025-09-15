@echo off
echo Building MT Career Platform for Production...
echo.

echo Installing/updating frontend dependencies...
cd frontend
call npm install

echo.
echo Building frontend assets...
call npm run build

echo.
echo Production build complete!
echo Built assets are now in public/assets/
echo You can now serve the application using your web server or php -S localhost:8000 -t public

cd ..
pause
