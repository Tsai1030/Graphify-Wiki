$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

& .\.venv\Scripts\python.exe .\scripts\search_kb.py @args
