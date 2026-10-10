param([string]$Executable = 'src-tauri\target\debug\relay-terminal.exe', [int]$Port = 9225, [string]$DataDirectory = 'artifacts\test-profile')
$ErrorActionPreference = 'Stop'
if (Get-Process -Name 'relay-terminal','Relay Terminal' -ErrorAction SilentlyContinue) { throw 'Close the existing Relay test window before launching another test instance.' }
$project = Split-Path $PSScriptRoot -Parent
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = "--remote-debugging-port=$Port --remote-debugging-address=127.0.0.1"
$env:RELAY_DATA_DIR = Join-Path $project $DataDirectory
$exe = Join-Path $project $Executable
Start-Process -FilePath $exe -WorkingDirectory $project -WindowStyle Hidden -PassThru | Select-Object Id, ProcessName
