@echo off
title Lumina AI Studio - Lemo-OpusCar & Gemini CLI Backend
echo ========================================================
echo       LUMINA AI VIDEO STUDIO - OPUSCAR BACKEND
echo       API Gemini CLI & Lemo-OpusCar 99 Styles
echo ========================================================
echo.
echo Dang khoi dong Backend Python tai cong 8086...
echo Truy cap tai: http://localhost:8086
echo.
start http://localhost:8086
python tools/opuscar-studio/server.py
pause
