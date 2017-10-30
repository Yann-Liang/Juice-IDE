@echo off
setlocal

set folderName=%1

for /f %%a in ('dir /b /s "%folderName%\*.sol"') do (
  solc.exe %%a --bin --abi --optimize --overwrite -o %2
)

endlocal