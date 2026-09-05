@echo off
title MedLens Development Server
cd /d "%~dp0"
set "PATH=C:\Users\Akshith redddy atla\AppData\Local\OpenAI\Codex\runtimes\cua_node\1b25664590014d28\bin;%PATH%"
echo Starting MedLens - AI-Powered Clinical Information Intelligence...
echo Opening in browser: http://localhost:5173
start http://localhost:5173
call npm.cmd run dev
pause
