@echo off
title BakeryBliss Complete Database Setup
color 0A
echo ===================================
echo BakeryBliss Complete Database Setup
echo ===================================
echo.
echo WARNING: This will DROP and recreate ALL database tables!
echo Any existing data will be lost and replaced with sample data.
echo.
echo Make sure XAMPP is running with MySQL service active.
echo.
set /p continue=Do you want to continue? (Y/N): 

if /i not "%continue%"=="Y" (
  echo Setup cancelled.
  pause
  exit /b
)

echo.
echo Checking MySQL connection...
mysql -u root -e "SELECT 1" 2>NUL
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Cannot connect to MySQL.
  echo Make sure XAMPP is running with MySQL service active.
  pause
  exit /b
)

echo MySQL connection successful!
echo.
echo Creating database if it doesn't exist...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS bakerybliss"

echo.
echo Setting up complete database with all tables...
mysql -u root bakerybliss < complete-database-setup.sql
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Failed to execute the complete database setup script.
  echo Check if the SQL file exists and is readable.
  pause
  exit /b
)

echo.
echo Verifying database tables...
echo.
echo === Database Tables ===
mysql -u root -e "SHOW TABLES FROM bakerybliss"

echo.
echo ✓ Database setup completed successfully with all required tables!
echo.
echo The following tables should be present:
echo - users
echo - categories
echo - products
echo - orders
echo - order_items
echo - chat_messages
echo - baker_applications
echo - order_reviews
echo - notifications
echo.
echo Default login credentials:
echo - Admin: username=admin, password=admin123
echo - Customer: username=customer, password=admin123
echo - Junior Baker: username=junior_baker, password=admin123
echo - Main Baker: username=main_baker, password=admin123
echo.
pause