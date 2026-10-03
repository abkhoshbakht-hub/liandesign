@echo off
cd /d D:\MyProgect\project-transfer
start "" /b node node_modules\next\dist\bin\next dev -p 3002 > dev.log 2> dev-err.log