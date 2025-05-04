@echo off
echo Starting BakeryBliss application...
echo.
echo This script will:
echo 1. Install all necessary dependencies
echo 2. Set the NODE_ENV environment variable to development
echo 3. Start the application server

echo.
echo Installing dependencies...
call npm install

echo.
echo Starting the application...
set NODE_ENV=development
call npx tsx server/index.ts

echo.
echo If the application doesn't start, please check if:
echo - XAMPP is running with MySQL service active
echo - Your Node.js installation is working properly
echo - Port 5000 is available
echo.
echo Press Ctrl+C to stop the server when you're done.