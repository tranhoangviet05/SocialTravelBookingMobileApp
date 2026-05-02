@echo off
title Social Travel Booking - Start All Services
echo ============================================
echo   Social Travel Booking - Khoi dong Server
echo ============================================
echo.

:: ── BACKEND API ───────────────────────────────
echo [1/5] Khoi dong Backend API (http://localhost:8000)...
start "Backend API" cmd /k "cd /d %~dp0backend && php -S 127.0.0.1:8000 -t public"

:: Doi 2 giay de backend khoi dong truoc
timeout /t 2 /nobreak > nul

:: ── WEBSOCKET (REVERB) ────────────────────────
echo [2/5] Khoi dong WebSocket Reverb (ws://localhost:8080)...
start "WebSocket Reverb" cmd /k "cd /d %~dp0backend && php artisan reverb:start"

:: ── FRONTEND WEB ──────────────────────────────
echo [3/5] Khoi dong Frontend Web (http://localhost:5173)...
start "Frontend Web" cmd /k "cd /d %~dp0frontend_web && npm run dev"

:: ── NGROK ─────────────────────────────────────
echo [4/5] Khoi dong Ngrok (Tunneling port 8000)...
start "Ngrok" cmd /k "cd /d %~dp0frontend_web && npm run expose"

echo.
echo ============================================
echo   Tat ca services da duoc khoi dong!
echo.
echo   Backend API  : http://localhost:8000
echo   WebSocket    : ws://localhost:8080
echo   Frontend Web : http://localhost:5173
echo   Ngrok        : Tunneling port 8000
echo   --------------------------------------------
echo   Mobile App   : Run 'flutter run' to start
echo ============================================
echo.
echo Dong cua so nay se KHONG tat cac server.
pause
