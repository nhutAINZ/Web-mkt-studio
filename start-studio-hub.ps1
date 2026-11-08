# ToyStudio AI Hub Launcher (PowerShell)
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      TOYSTUDIO AI HUB - HỆ THỐNG ĐIỀU HÀNH STUDIO       " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Đang khởi động máy chủ nội bộ tại cổng 8085..." -ForegroundColor Green
Write-Host "Truy cập tại: http://localhost:8085" -ForegroundColor White
Write-Host ""

Start-Process "http://localhost:8085"
python -m http.server 8085 --directory tools/toy-studio-hub
