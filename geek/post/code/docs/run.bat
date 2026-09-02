@echo off
setlocal enabledelayedexpansion
for /f "delims=" %%i in ('dir /a-d /b *.*') do (
 echo %%i:size=%%~zi &echo.
 if %%~zi equ 0 ( del /f /s /q %%i  )
)
