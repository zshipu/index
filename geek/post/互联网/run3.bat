
:aaa
set /a n+=1
if %n% leq 1000 (

run.bat

cjai.exe
ping /n 10 127.1 >nul

goto :aaa)