@echo off
echo ========================================
echo   INVENTARIS GUDANG - AUTO START
echo ========================================
echo.
echo Memulai Backend dan Frontend...
echo.
echo CATATAN:
echo - Pastikan XAMPP (Apache + MySQL) sudah running
echo - 2 window akan terbuka, JANGAN DITUTUP!
echo.
pause

start "Laravel Backend" cmd /k "cd backend && echo Starting Laravel Backend... && php artisan serve"
timeout /t 3 /nobreak >nul
start "React Frontend" cmd /k "cd frontend && echo Starting React Frontend... && npm start"

echo.
echo ========================================
echo   APLIKASI SEDANG STARTING...
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Browser akan otomatis terbuka dalam beberapa detik...
echo.
pause
