$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $root "frontend")

npm run dev
