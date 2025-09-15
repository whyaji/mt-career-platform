@echo off
echo Starting MT Career Platform Development Servers...
echo.

REM Start Lumen backend server
echo Starting Lumen backend on http://localhost:8000...
start "Lumen Backend" cmd /k "php -S localhost:8000 -t public"

REM Wait a moment
timeout /t 2 /nobreak > nul

REM Start Vite frontend development server
echo Starting Vite frontend development server on http://localhost:5193...
cd frontend
start "Vite Frontend" cmd /k "npm run dev"

echo.
echo Development servers started!
echo Backend: http://localhost:8000
echo Frontend Dev: http://localhost:5193
echo.
echo Press any key to exit this script (servers will continue running)...
pause > nul
