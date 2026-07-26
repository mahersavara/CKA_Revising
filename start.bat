@echo off
echo Starting Docker Desktop if it is not running...
powershell -Command "Start-Process -FilePath 'C:\Program Files\Docker\Docker\Docker Desktop.exe'"

echo Waiting for Docker daemon to be ready...
:loop
docker info >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 2 /nobreak >nul
    goto loop
)

echo Starting CK-X Simulator...
cd /d "%~dp0ck-x-simulator"
docker compose up -d

echo.
echo CK-X Simulator started successfully!
echo You can access it at: http://localhost:30080
echo.
pause
