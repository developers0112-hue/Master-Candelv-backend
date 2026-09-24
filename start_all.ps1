$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$venvPath = Join-Path $root ".venv"
$pythonExe = Join-Path $venvPath "Scripts\python.exe"
$backendDir = Join-Path $root "backend"
$serverScript = Join-Path $backendDir "server.py"
$twelveDataScript = Join-Path $backendDir "twelve_data_forwarder.py"
$requirementsFile = Join-Path $backendDir "requirements.txt"
$frontendFile = Join-Path $root "frontend\index.html"

$listener = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($listener) {
    Write-Host "Stopping stale WebSocket server on port 8080..." -ForegroundColor Yellow
    $listener | ForEach-Object {
        try {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop
        } catch {
            Write-Host "Could not stop process $($_.OwningProcess)" -ForegroundColor DarkYellow
        }
    }
    Start-Sleep -Seconds 1
}

if (-not (Test-Path $backendDir)) {
    Write-Host "Creating backend directory..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $backendDir -Force | Out-Null
}

if (-not (Test-Path $pythonExe)) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Cyan
    py -m venv $venvPath
}

Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
& $pythonExe -m pip install --quiet -r $requirementsFile

Write-Host "Starting WebSocket server..." -ForegroundColor Green
$serverProcess = Start-Process -FilePath $pythonExe -ArgumentList @($serverScript) -WorkingDirectory $root -PassThru

Start-Sleep -Seconds 1

Write-Host "Starting Twelve Data forwarder..." -ForegroundColor Green
$twelveDataProcess = Start-Process -FilePath $pythonExe -ArgumentList @($twelveDataScript) -WorkingDirectory $root -PassThru

Start-Sleep -Seconds 1

Write-Host "Opening frontend dashboard..." -ForegroundColor Green
Start-Process $frontendFile

Write-Host "" 
Write-Host "All services started." -ForegroundColor Yellow
Write-Host "Server PID: $($serverProcess.Id)" -ForegroundColor Yellow
Write-Host "Twelve Data PID: $($twelveDataProcess.Id)" -ForegroundColor Yellow
Write-Host "Dashboard: $frontendFile" -ForegroundColor Yellow
Write-Host "Press Ctrl+C in each terminal to stop the running processes." -ForegroundColor Gray
