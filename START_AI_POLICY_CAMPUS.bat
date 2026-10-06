@echo off
setlocal
cd /d "%~dp0"
title AI Policy Campus
echo.
echo ==========================================
echo   AI POLICY CAMPUS - FINAL DEMO
echo ==========================================
echo.

where node >nul 2>nul
if %errorlevel%==0 (
  echo Starting full local server...
  start "" /b cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:4173"
  node server.js
  goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
  echo Node.js was not found. Starting frontend demo with Python...
  echo Guided Tour works; server-only AI media features may be unavailable.
  start "" /b cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:8000"
  py -m http.server 8000 --bind 127.0.0.1
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  echo Node.js was not found. Starting frontend demo with Python...
  start "" /b cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:8000"
  python -m http.server 8000 --bind 127.0.0.1
  goto :eof
)

echo.
echo Neither Node.js nor Python was found.
echo Install Node.js once, then double-click this file again.
echo.
pause
