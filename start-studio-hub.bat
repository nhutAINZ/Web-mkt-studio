@echo off
title ToyStudio AI Hub Launcher
echo ========================================================
echo       TOYSTUDIO AI HUB - HE THONG DIEU HANH STUDIO
echo ========================================================
echo.
echo Dang khoi dong may chu noi bo tai cong 8085...
echo Truy cap tai: http://localhost:8085
echo.
start http://localhost:8085
python -m http.server 8085 --directory tools/toy-studio-hub
pause
