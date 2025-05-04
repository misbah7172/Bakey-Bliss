@echo off
echo BakeryBliss Database Check Tool
echo ============================
echo.
echo This script will check if the BakeryBliss database is properly set up
echo by showing some sample records from key tables.
echo.
echo Make sure XAMPP is running with MySQL service active before continuing.
echo.
pause

echo.
echo Checking MySQL connection...
echo.
mysql -u root -e "SELECT 1" 2>NUL
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

mysql -u root -e "SHOW DATABASES LIKE 'bakerybliss'" | find "bakerybliss" >NUL
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Database 'bakerybliss' does not exist.
  echo Please run setup-database.bat first to create the database.
  echo.
  pause
  exit /b
)

echo Database 'bakerybliss' exists. Checking tables...
echo.

echo === Users table ===
mysql -u root -e "SELECT id, username, role FROM bakerybliss.users LIMIT 5"
echo.

echo === Categories table ===
mysql -u root -e "SELECT id, name FROM bakerybliss.categories LIMIT 5"
echo.

echo === Products table ===
mysql -u root -e "SELECT id, name, price FROM bakerybliss.products LIMIT 5"
echo.

echo Database check completed. If you see data above, the database is set up correctly.
echo.
echo If no data is shown or tables are missing, run setup-database.bat to reset the database.
echo.
pause