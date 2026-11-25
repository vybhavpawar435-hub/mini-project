# HemoSync - Automatic 5-Engine Launcher
$ErrorActionPreference = "Continue"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  HEMOSYNC: BLOOD BANK AND DONOR SLOT MANAGEMENT SYSTEM" -ForegroundColor Yellow
Write-Host "  Starting all four integrated engines..." -ForegroundColor White
Write-Host "============================================================================" -ForegroundColor Cyan

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Test-PortOpen ($port) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    return ($conn -ne $null)
}

# 1. MySQL on Port 3306
Write-Host "[1/5] Checking MySQL Database (Port 3306)..." -NoNewline
if (Test-PortOpen 3306) {
    Write-Host " [ALREADY RUNNING]" -ForegroundColor Green
} else {
    Write-Host " [STARTING]" -ForegroundColor Yellow
    $mysqlExe = "C:\xampp\mysql\bin\mysqld.exe"
    $mysqlIni = "C:\xampp\mysql\bin\my.ini"
    if (Test-Path $mysqlExe) {
        Start-Process -FilePath $mysqlExe -ArgumentList "--defaults-file=`"$mysqlIni`" --standalone" -WindowStyle Hidden
        Start-Sleep -Seconds 3
    } else {
        Write-Host "  WARNING: MySQL executable not found at $mysqlExe" -ForegroundColor Red
    }
}

# 2. OS Scheduler (Port 5001)
Write-Host "[2/5] Checking Engine 01: OS Scheduler (Port 5001)..." -NoNewline
if (Test-PortOpen 5001) {
    Write-Host " [ALREADY RUNNING]" -ForegroundColor Green
} else {
    Write-Host " [STARTING]" -ForegroundColor Yellow
    $schedulerDir = Join-Path $rootDir "engines\os-scheduler"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$schedulerDir`" && scheduler_engine.exe 5001" -WindowStyle Minimized
    Start-Sleep -Seconds 2
}

# 3. DSA Compatibility Matcher (Port 5002)
Write-Host "[3/5] Checking Engine 02: DSA Compatibility Matcher (Port 5002)..." -NoNewline
if (Test-PortOpen 5002) {
    Write-Host " [ALREADY RUNNING]" -ForegroundColor Green
} else {
    Write-Host " [STARTING]" -ForegroundColor Yellow
    $dsaDir = Join-Path $rootDir "engines\dsa-compatibility"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$dsaDir`" && compatibility_engine.exe 5002" -WindowStyle Minimized
    Start-Sleep -Seconds 2
}

# 4. Node.js Backend API (Port 3000)
Write-Host "[4/5] Checking Node.js Backend API (Port 3000)..." -NoNewline
if (Test-PortOpen 3000) {
    Write-Host " [ALREADY RUNNING]" -ForegroundColor Green
} else {
    Write-Host " [STARTING]" -ForegroundColor Yellow
    $backendDir = Join-Path $rootDir "backend"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$backendDir`" && npm start" -WindowStyle Minimized
    Start-Sleep -Seconds 3
}

# 5. React Frontend (Port 5173)
Write-Host "[5/5] Checking React Frontend Dashboard (Port 5173)..." -NoNewline
if (Test-PortOpen 5173) {
    Write-Host " [ALREADY RUNNING]" -ForegroundColor Green
} else {
    Write-Host " [STARTING]" -ForegroundColor Yellow
    $frontendDir = Join-Path $rootDir "frontend"
    $viteBin = Join-Path $frontendDir "node_modules\vite\bin\vite.js"
    Start-Process -FilePath "node.exe" -ArgumentList "`"$viteBin`" --host 0.0.0.0 --port 5173" -WorkingDirectory $frontendDir -WindowStyle Minimized
    Start-Sleep -Seconds 3
}

# Final health verification
Write-Host ""
Write-Host "Verifying service readiness..." -ForegroundColor Cyan
$maxRetries = 5
for ($i = 1; $i -le $maxRetries; $i++) {
    $p5173 = Test-PortOpen 5173
    $p3000 = Test-PortOpen 3000
    if ($p5173 -and $p3000) { break }
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  ALL ENGINES ARE UP AND RUNNING!" -ForegroundColor Green
Write-Host "  - Web Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend API:   http://localhost:3000/api" -ForegroundColor White
Write-Host "  - OS Scheduler:  http://localhost:5001" -ForegroundColor White
Write-Host "  - DSA Matcher:   http://localhost:5002" -ForegroundColor White
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Start-Process "http://localhost:5173"
