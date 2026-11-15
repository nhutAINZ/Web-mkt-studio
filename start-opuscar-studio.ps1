# PowerShell Launcher for Lemo OpusCar Studio
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      LEMO OPUSCAR STUDIO - 99 FILM STYLES GENERATOR" -ForegroundColor Yellow
Write-Host "      Thiet ke theo tieu chuan Unslop Craft" -ForegroundColor Gray
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dang khoi dong may chu noi bo tai cong 8086..." -ForegroundColor Green
Write-Host "Truy cap tai: http://localhost:8086" -ForegroundColor Cyan
Write-Host ""

Start-Process "http://localhost:8086"
python -m http.server 8086 --directory tools/opuscar-studio
