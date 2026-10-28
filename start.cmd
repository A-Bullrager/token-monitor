@echo off
setlocal
cd /d "%~dp0"
rem Some shells export this and make Electron run as plain Node.
set ELECTRON_RUN_AS_NODE=

if exist "dist\Token Monitor-win32-x64\Token Monitor.exe" (
  start "" "dist\Token Monitor-win32-x64\Token Monitor.exe"
  exit /b 0
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 pause & exit /b 1
)

call npm start
