$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    throw "uv is required but was not found in PATH."
}

$pythonExe = Join-Path $root ".venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    uv venv .venv --python 3.12 | Out-Host
}

$graphifyRepo = Join-Path $root "graphify_repo"
if (-not (Test-Path $graphifyRepo)) {
    throw "graphify_repo is missing. Clone https://github.com/safishamsi/graphify into .\\graphify_repo before building a private knowledge base."
}

uv pip install --python $pythonExe -e .\graphify_repo openai python-dotenv | Out-Host
& $pythonExe .\scripts\build_graphify_kb.py --root data_markdown --output graphify-out @args
