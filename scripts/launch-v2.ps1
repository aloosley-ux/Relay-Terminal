param([string]$Executable = 'src-tauri\target\release\relay-terminal.exe', [int]$Port = 9225, [string]$Profile = 'artifacts\v2-test-profile')
$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) { throw "Test endpoint $Port is already in use. No existing process was changed." }
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = "--remote-debugging-port=$Port --remote-debugging-address=127.0.0.1"
$env:RELAY_DATA_DIR = Join-Path $project $Profile
$env:RUST_BACKTRACE = '1'
New-Item -ItemType Directory -Path $env:RELAY_DATA_DIR -Force | Out-Null
$instance = Start-Process -FilePath (Join-Path $project $Executable) -WorkingDirectory $project -WindowStyle Hidden -RedirectStandardError (Join-Path $env:RELAY_DATA_DIR 'native-stderr.log') -RedirectStandardOutput (Join-Path $env:RELAY_DATA_DIR 'native-stdout.log') -PassThru
$instance | Select-Object Id,ProcessName | Out-String | Write-Output
$instance.WaitForExit()
Write-Output "Relay instance exited with code $($instance.ExitCode)"
Get-Content -LiteralPath (Join-Path $env:RELAY_DATA_DIR 'native-stderr.log') -ErrorAction SilentlyContinue
