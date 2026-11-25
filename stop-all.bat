@echo off
title Stop HemoSync Services
echo Stopping all HemoSync Blood Bank services...

echo Killing processes on port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":5173 .*LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo Killing processes on port 3000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":3000 .*LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo Killing processes on port 5001 (OS Scheduler)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":5001 .*LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo Killing processes on port 5002 (DSA Matcher)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":5002 .*LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo All HemoSync services stopped successfully.
pause
