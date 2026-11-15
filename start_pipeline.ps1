# Khởi động đồng thời cả Backend và Frontend Lumina AI Video Studio
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  LUMINA - END-TO-END AI VIDEO GENERATION PIPELINE" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "[1/2] Đang khởi động FastAPI Backend (Port 8000)..." -ForegroundColor Green
Start-Process -FilePath "python" -ArgumentList "pipeline\run_backend.py" -NoNewWindow:$false

Start-Sleep -Seconds 2

Write-Host "[2/2] Đang khởi động Streamlit Frontend (Port 8501)..." -ForegroundColor Green
Start-Process -FilePath "python" -ArgumentList "pipeline\run_frontend.py" -NoNewWindow:$false

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Hệ thống đã chạy thành công!" -ForegroundColor Green
Write-Host "  - Backend API: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "  - Frontend UI: http://127.0.0.1:8501" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
