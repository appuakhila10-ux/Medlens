@echo off
title Push MedLens to GitHub
cd /d "%~dp0"
set "PATH=C:\Users\Akshith redddy atla\AppData\Local\Programs\MinGit\cmd;%PATH%"
echo Pushing MedLens repository to https://github.com/appuakhila10-ux/Medlens.git...
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo  Push to GitHub completed successfully!
    echo ========================================
) else (
    echo ========================================
    echo  Push encountered authentication requirement.
    echo  GitHub requires a Personal Access Token (PAT).
    echo  1. Create a token at: https://github.com/settings/tokens
    echo  2. Use your GitHub username and the PAT as your password.
    echo ========================================
)
pause