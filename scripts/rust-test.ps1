$ErrorActionPreference = 'Stop'
$env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH
Set-Location -LiteralPath (Join-Path (Split-Path $PSScriptRoot -Parent) 'src-tauri')
& rtk cargo test
exit $LASTEXITCODE
