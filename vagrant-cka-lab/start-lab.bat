@echo off
title CKA Kubernetes Lab (Hyper-V)

:: Tu dong nang quyen Administrator neu chua co
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -NoProfile -Command "Start-Process cmd.exe -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

echo ========================================================
echo         Certified Kubernetes Administrator (CKA)
echo                VAGRANT HYPER-V LAB LAUNCHER
echo ========================================================
echo.

echo [1/3] Kiem tra va khoi dong may ao (Master va Worker qua Hyper-V)...
vagrant up --provider=hyperv

echo.
echo [2/3] Dang dong bo IP vao SSH Config (~/.ssh/config)...
powershell -ExecutionPolicy Bypass -File "%~dp0update-ssh-config.ps1"

echo.
echo [3/3] Dang ket noi SSH vao Master Node (k8s-control)...
echo.
echo --------------------------------------------------------
echo  MEO LENH THI CKA SAN CO TRONG TERMINAL:
echo   - k get nodes
echo   - k get pods -A
echo   - $do   = "--dry-run=client -o yaml"
echo   - $now  = "--force --grace-period=0"
echo   - sudo -i (chuyen sang root)
echo --------------------------------------------------------
echo.
vagrant ssh master

if %errorlevel% neq 0 (
    echo.
    echo [THONG BAO] Ket noi SSH da ket thuc hoac co loi.
    pause
)
