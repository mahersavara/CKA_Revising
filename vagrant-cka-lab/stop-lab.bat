@echo off
title Stop CKA Kubernetes Lab (Hyper-V)

:: Tu dong nang quyen Administrator neu chua co
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -NoProfile -Command "Start-Process cmd.exe -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

echo ========================================================
echo         Certified Kubernetes Administrator (CKA)
echo                SHUTTING DOWN HYPER-V LAB
echo ========================================================
echo.

echo Dang tat an toan cac may ao Master va Worker (vagrant halt)...
vagrant halt

echo.
echo ========================================================
echo   Da tat tat ca may ao Hyper-V thanh cong!
echo ========================================================
echo Cua so se tu dong dong sau 3 giay...
timeout /t 3 >nul
