# PowerShell Launcher for Lumina AI Video Studio
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      LUMINA AI VIDEO STUDIO - OPUSCAR BACKEND" -ForegroundColor Yellow
Write-Host "      API Gemini CLI & Lemo-OpusCar 99 Styles" -ForegroundColor Gray
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dang khoi dong Backend Python tai cong 8086..." -ForegroundColor Green
Write-Host "Truy cap tai: http://localhost:8086" -ForegroundColor Cyan
Write-Host ""

Start-Process "http://localhost:8086"
python tools/opuscar-studio/server.py
