@echo off
title Lemo OpusCar Studio - 99 Film Styles Video Generator
echo ========================================================
echo       LEMO OPUSCAR STUDIO - 99 FILM STYLES GENERATOR
echo       Thiet ke theo tieu chuan Unslop Craft
echo ========================================================
echo.
echo Dang khoi dong may chu noi bo tai cong 8086...
echo Truy cap tai: http://localhost:8086
echo.
start http://localhost:8086
python -m http.server 8086 --directory tools/opuscar-studio
pause
