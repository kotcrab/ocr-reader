call npm install
if errorlevel 1 goto :ERR
call npm run build
if errorlevel 1 goto :ERR
echo You can now close this window.
goto :FIN

:ERR
echo.
echo Something went wrong while building. Look at the output above for more details.
goto :FIN

:FIN
pause > NUL
