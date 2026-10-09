@echo off
title AEDPM Group-B Exam Preparation Portal
echo =================================================================
echo   Starting Indian Railways AEDPM Group-B Exam Preparation Portal
echo =================================================================
cd /d "%~dp0"
start http://localhost:8080/index.html
python server.py
pause
