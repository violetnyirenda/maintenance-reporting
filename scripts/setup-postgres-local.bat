@echo off
REM Local PostgreSQL Setup Script for Windows

setlocal enabledelayedexpansion

REM Configuration variables
set DB_USER=postgres
set DB_PASSWORD=admin
set DB_NAME=maintenance_reporting
set DB_HOST=localhost
set DB_PORT=5432

echo.
echo =====================================
echo Local PostgreSQL Setup Script
echo =====================================
echo.

echo Configuration:
echo   Database User: %DB_USER%
echo   Database Name: %DB_NAME%
echo   Database Host: %DB_HOST%
echo   Database Port: %DB_PORT%
echo   Password: ***
echo.

echo Checking PostgreSQL installation...
where psql >nul 2>nul
if errorlevel 1 (
    echo PostgreSQL is not installed or not in PATH.
    echo Install from: https://www.postgresql.org/download/windows/
    echo Make sure to add PostgreSQL bin folder to your system PATH.
    pause
    exit /b 1
)
echo [OK] PostgreSQL found
echo.

echo Testing PostgreSQL connection...
psql -h %DB_HOST% -U %DB_USER% -d postgres -c "SELECT 1" >nul 2>nul
if errorlevel 1 (
    echo Could not connect to PostgreSQL.
    echo Make sure PostgreSQL service is running.
    pause
    exit /b 1
)
echo [OK] PostgreSQL service is running
echo.

echo Setting up database...
psql -h %DB_HOST% -U %DB_USER% -d postgres << EOF
ALTER USER postgres PASSWORD '%DB_PASSWORD%';
DROP DATABASE IF EXISTS %DB_NAME%;
CREATE DATABASE %DB_NAME%;
EOF

if errorlevel 1 (
    echo Error creating database
    pause
    exit /b 1
)
echo [OK] Database created successfully
echo.

echo Initializing database schema...
cd ..\server
call npm run db:init

if errorlevel 1 (
    echo Error initializing database
    pause
    exit /b 1
)

echo.
echo =====================================
echo Setup Complete!
echo =====================================
echo.
echo Connection details:
echo   psql -h %DB_HOST% -U %DB_USER% -d %DB_NAME%
echo.
echo To start the server:
echo   cd server ^&^& npm run dev
echo.
pause
