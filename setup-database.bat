@echo off
echo BakeryBliss Database Setup Tool
echo ==============================
echo.
echo This script will:
echo 1. Check if the 'bakerybliss' database exists in MySQL
echo 2. Create the database if it doesn't exist
echo 3. Set up all required tables
echo 4. Initialize the database with sample data
echo.
echo Make sure XAMPP is running with MySQL service active before continuing.
echo.
pause

echo.
echo Checking MySQL connection...
echo.
set MYSQL_PATH=C:\xampp\mysql\bin\mysql
%MYSQL_PATH% -u root -e "SELECT 1" 2>NUL
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Cannot connect to MySQL.
  echo Make sure XAMPP is running with MySQL service active.
  echo.
  pause
  exit /b
)

echo MySQL connection successful!
echo.
echo Checking if 'bakerybliss' database exists...
echo.

%MYSQL_PATH% -u root -e "SHOW DATABASES LIKE 'bakerybliss'" | find "bakerybliss" >NUL
if %ERRORLEVEL% EQU 0 (
  echo Database 'bakerybliss' already exists.
  echo.
  echo Do you want to recreate the database? This will DELETE all existing data! (y/n)
  set /p choice=
  if /i "%choice%" EQU "y" (
    echo Dropping existing database...
    %MYSQL_PATH% -u root -e "DROP DATABASE bakerybliss"
    echo Creating fresh database...
    %MYSQL_PATH% -u root -e "CREATE DATABASE bakerybliss"
  ) else (
    echo Database setup cancelled. Existing database will be used.
    pause
    exit /b
  )
) else (
  echo Database 'bakerybliss' does not exist.
  echo Creating database...
  %MYSQL_PATH% -u root -e "CREATE DATABASE bakerybliss"
)

echo.
echo Setting up database tables...
echo.
%MYSQL_PATH% -u root bakerybliss < server/database_setup.sql
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Failed to set up database tables.
  echo.
  pause
  exit /b
)

echo.
echo ✓ Database setup completed successfully!
echo.
echo You can now run the application with start-windows.bat
echo.
pause