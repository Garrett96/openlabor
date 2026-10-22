@echo off
echo Welcome to OpenLabor Setup!
echo.
echo This script will install dependencies, build the application, and start a local server.
echo It requires Node.js to be installed on your system.
echo.

REM Consent Prompt
set /p consent="Do you consent to proceeding with the installation and setup? (y/N): "
if /I not "%consent%"=="y" (
    echo Setup cancelled.
    pause
    exit /b
)

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed.
    echo Please install it from https://nodejs.org/ and try again.
    pause
    exit /b
)

REM Install dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed.
)

REM Build the application
echo Building application...
call npm run build

echo.
echo Setup complete! Starting local server...
echo OpenLabor is now running at: http://localhost:8070
echo Press Ctrl+C to stop the server.
echo.

REM Start the local server on port 6070
call npx serve dist -l 8070 -s
pause
