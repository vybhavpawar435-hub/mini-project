@echo off
title HemoSync Blood Bank Launcher
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-all.ps1"
if %errorlevel% neq 0 (
    echo.
    echo Launcher encountered an error. Press any key to exit.
    pause
)
