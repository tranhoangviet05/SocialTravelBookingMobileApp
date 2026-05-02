@echo off
echo ========================================
echo   Social Travel Booking - Setup Script
echo ========================================

:: ── BACKEND ──────────────────────────────
echo.
echo [1/3] Cai dat Backend (Laravel)...
cd backend
if not exist bootstrap\cache mkdir bootstrap\cache
composer install --ignore-platform-req=ext-grpc
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
cd ..

:: ── FRONTEND ─────────────────────────────
echo.
echo [2/3] Cai dat Frontend (React)...
cd frontend_web
call npm install
cd ..

:: ── FLUTTER ──────────────────────────────
echo.
echo [3/3] Cai dat Mobile (Flutter)...
cd mobile_app
flutter pub get
cd ..

echo.
echo ========================================
echo   Hoan tat! De chay du an, chay:
echo.
echo   start.bat   (khoi dong tat ca cung luc)
echo.
echo   Hoac chay thu cong tung phan:
echo   Backend API : cd backend ^& php -S 127.0.0.1:8000 -t public
echo   WebSocket   : cd backend ^& php artisan reverb:start
echo   Frontend    : cd frontend_web ^& npm run dev
echo   Mobile      : cd mobile_app  ^& flutter run
echo ========================================
pause