@echo off
echo Stopping CK-X Simulator...
cd /d "%~dp0ck-x-simulator"
docker compose down

echo.
echo CK-X Simulator stopped successfully!
echo.
pause
