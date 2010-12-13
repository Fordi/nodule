@echo off
set WD=%CD%
call run_node.cmd "%~d0%~p0server-sample\nodule.nodejs"
pause
cd "%WD%"