Write-Host "========================================" -ForegroundColor Green
Write-Host "  Football Live Streaming Platform" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if FFmpeg is available
$ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpeg) {
    Write-Host "WARNING: FFmpeg not found in PATH." -ForegroundColor Yellow
    Write-Host "Install with: winget install Gyan.FFmpeg" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Starting Backend Server (RTMP + API)..." -ForegroundColor Cyan
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev" -PassThru

Start-Sleep -Seconds 3

Write-Host "Starting Frontend Dev Server..." -ForegroundColor Cyan
$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -PassThru

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Servers are starting up!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend:   http://localhost:5173" -ForegroundColor White
Write-Host "API:        http://localhost:3001" -ForegroundColor White
Write-Host "RTMP:       rtmp://localhost:1935/live" -ForegroundColor White
Write-Host "Media:      http://localhost:8888/live" -ForegroundColor White
Write-Host ""
Write-Host "OBS Setup:" -ForegroundColor Yellow
Write-Host "  1. Open OBS Studio > Settings > Stream" -ForegroundColor White
Write-Host "  2. Service: Custom" -ForegroundColor White
Write-Host "  3. Server: rtmp://localhost:1935/live" -ForegroundColor White
Write-Host "  4. Stream Key: (get from dashboard)" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to stop both servers..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop both processes
Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontendJob.Id -Force -ErrorAction SilentlyContinue
Write-Host "Servers stopped." -ForegroundColor Red
