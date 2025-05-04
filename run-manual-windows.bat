@echo off
title BakeryBliss Manual Setup
echo ====================================
echo BakeryBliss Manual Setup for Windows
echo ====================================
echo.
echo This script will:
echo 1. Check if your MySQL server is running
echo 2. Create the complete database with all required tables
echo 3. Start the application server properly
echo.

echo Checking MySQL connection...
mysql -u root -e "SELECT 1" 2>NUL
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Cannot connect to MySQL.
  echo Please make sure XAMPP is running with MySQL service active.
  pause
  exit /b
)

echo MySQL connection successful!
echo.

echo Creating/checking database...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS bakerybliss"
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Failed to create database.
  pause
  exit /b
)

echo Setting up complete database tables...
mysql -u root bakerybliss < server/database_setup.sql
if %ERRORLEVEL% NEQ 0 (
  echo WARNING: Could not execute SQL script. Continuing anyway...
)

echo.
echo ===================================
echo Starting application server...
echo ===================================
echo.
echo The server will be available at: http://localhost:5000
echo Press Ctrl+C to stop the server when you're done.
echo.

rem This is the key part - setting NODE_ENV properly on Windows
set NODE_ENV=development
call npx tsx server/index.ts
rem If the server crashes or fails to start, this will keep the window open
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo ===================================
  echo ERROR: Server failed to start with error code %ERRORLEVEL%
  echo ===================================
  echo.
  echo Common reasons for this error:
  echo 1. Port 5000 is already in use by another application
  echo 2. Database connection issues
  echo 3. Missing dependencies (try running "npm install" manually)
  echo.
  echo Try these steps:
  echo 1. Make sure XAMPP MySQL is running
  echo 2. Run setup-complete-database.bat to reset the database
  echo 3. Close any other applications that might be using port 5000
  echo 4. Try running "npm install" in this directory
  echo.
)

echo.
if %ERRORLEVEL% NEQ 0 (
  echo Server stopped with error code %ERRORLEVEL%
  echo Check the error messages above.
)
pause