@echo off
cd /d "%~dp0"
echo Abrindo http://localhost:8000 ... (feche esta janela para parar o servidor)
start "" "http://localhost:8000"
python -m http.server 8000 2>nul || py -m http.server 8000 2>nul || npx --yes serve -l 8000 .
pause
