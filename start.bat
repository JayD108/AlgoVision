@echo off
title DAA Interactive Dashboard
echo ==============================
echo   DAA Dashboard - Starting Up
echo ==============================

echo [INFO] Installing Python dependencies...
pip install -r "%~dp0requirements.txt" -q

echo [INFO] Starting FastAPI backend on http://localhost:8080 ...
start "DAA Backend"  cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --host 127.0.0.1 --port 8080 --reload"

echo [INFO] Waiting for backend to boot...
timeout /t 3 /nobreak >nul

echo [INFO] Serving frontend on http://localhost:5500 ...
start "DAA Frontend" cmd /k "cd /d %~dp0frontend && python -m http.server 5500 --bind 127.0.0.1"

timeout /t 2 /nobreak >nul

echo [INFO] Opening browser...
start "" "http://localhost:5500"

echo.
echo ==============================
echo   Backend  : http://localhost:8080
echo   Frontend : http://localhost:5500
echo   API Docs : http://localhost:8080/docs
echo ==============================
