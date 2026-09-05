@echo off
title MedLens Development Server (Frontend + Backend)
cd /d "%~dp0"
set "PATH=C:\Users\Akshith redddy atla\AppData\Local\OpenAI\Codex\runtimes\cua_node\1b25664590014d28\bin;%PATH%"
echo ======================================================================
echo  Starting MedLens - AI-Powered Clinical Information Intelligence
echo  Frontend (Vite): http://localhost:5173
echo  Backend API (Express): http://localhost:3001
echo ======================================================================
start http://localhost:5173
call npm.cmd run dev:all
pause
