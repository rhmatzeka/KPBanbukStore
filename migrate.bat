@echo off
echo ===================================
echo Menjalankan Migration Database
echo ===================================

cd backend
C:\xampp\php\php.exe artisan migrate

echo.
echo ===================================
echo Migration selesai!
echo ===================================
pause
