@echo off

:restart
node index.js

if %ERRORLEVEL% NEQ 67 (
	goto restart
) else (
	pause >nul
	exit /b 0
)