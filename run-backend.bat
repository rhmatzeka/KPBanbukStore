@echo off
echo ===================================
echo Menjalankan Laravel Backend
echo ===================================
echo.
echo Backend akan jalan di: http://localhost:8000
echo Tekan Ctrl+C untuk stop
echo.

cd backend
C:\xampp\php\php.exe artisan serve

pause
