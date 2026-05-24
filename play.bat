@echo off
title KOF 2002 - Starting...
echo ============================================
echo   KOF 2002 POC - Launching Game
echo ============================================
echo.

:: Check if node exists
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: Check if dependencies installed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)

:: Start dev server and open browser
echo Starting game server...
echo Opening browser at http://localhost:5173
echo.
echo Press Ctrl+C to stop the server.
echo ============================================
start http://localhost:5173
call npx vite --host
