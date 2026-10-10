param([switch]$DebugBuild, [switch]$NoBundle)
$ErrorActionPreference = 'Stop'
$env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH
Set-Location -LiteralPath (Split-Path $PSScriptRoot -Parent)
$arguments = @('run', 'tauri', '--', 'build')
if ($DebugBuild) { $arguments += '--debug' }
if ($NoBundle) { $arguments += '--no-bundle' }
& npm.cmd @arguments
exit $LASTEXITCODE
