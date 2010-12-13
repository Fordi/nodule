@echo off
%~d1
cd "%~p1"
SET NODE_PATH=%~p0modules
"%~d0%~p0node.exe" "%~n1%~x1" %2-