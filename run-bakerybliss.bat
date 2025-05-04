@echo off
title BakeryBliss Bakery Website
color 0A

echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║                    BakeryBliss                         ║
echo ║               Bakery Website Launcher                  ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Welcome to BakeryBliss! This launcher will help you get started.
echo.

:MENU
echo Please select an option:
echo 1. Start the BakeryBliss application
echo 2. Check database status
echo 3. Setup/Reset database
echo 4. Exit
echo.
set /p choice=Enter your choice (1-4):

if "%choice%"=="1" goto START_APP
if "%choice%"=="2" goto CHECK_DB
if "%choice%"=="3" goto SETUP_DB
if "%choice%"=="4" goto EXIT
echo Invalid choice. Please try again.
goto MENU

:START_APP
cls
echo Starting BakeryBliss application...
echo.
echo This may take a few seconds to start up.
echo.
echo Press Ctrl+C to stop the server when you're done.
echo.
echo Once the server is running, open your web browser and go to:
echo http://localhost:5000
echo.
start http://localhost:5000
start-windows.bat
goto EXIT

:CHECK_DB
cls
echo Checking database status...
echo.
check-database.bat
goto MENU

:SETUP_DB
cls
echo Setting up/resetting database...
echo.
echo Choose database setup method:
echo 1. Basic setup (only creates essential tables)
echo 2. Complete setup (creates ALL required tables with sample data)
echo 3. Back to main menu
echo.
set /p dbchoice=Enter your choice (1-3):

if "%dbchoice%"=="1" (
  setup-database.bat
  goto MENU
)
if "%dbchoice%"=="2" (
  setup-complete-database.bat
  goto MENU
)
if "%dbchoice%"=="3" (
  goto MENU
)
echo Invalid choice. Please try again.
goto SETUP_DB

:EXIT
echo.
echo Thank you for using BakeryBliss!
echo.
pause