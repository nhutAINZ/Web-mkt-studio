@echo off
chcp 65001 >nul
echo ========================================================
echo   LUMINA - END-TO-END AI VIDEO GENERATION PIPELINE
echo ========================================================
echo [1/2] Đang khởi động FastAPI Backend (Port 8000)...
start "Lumina Backend" cmd /k "python pipeline\run_backend.py"

echo [2/2] Đang khởi động Streamlit Frontend (Port 8501)...
timeout /t 2 >nul
start "Lumina Frontend" cmd /k "python pipeline\run_frontend.py"

echo ========================================================
echo   Hệ thống đã sẵn sàng!
echo   - Backend API Docs: http://127.0.0.1:8000/docs
echo   - Frontend Studio : http://127.0.0.1:8501
echo ========================================================
