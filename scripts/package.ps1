$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
$destination = Join-Path $project 'Build'
New-Item -ItemType Directory -Path $destination -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $project 'src-tauri\target\release\relay-terminal.exe') -Destination (Join-Path $destination 'Relay Terminal.exe') -Force
Copy-Item -LiteralPath (Join-Path $project 'src-tauri\target\release\bundle\nsis\Relay Terminal_2.0.0_x64-setup.exe') -Destination $destination -Force
Copy-Item -LiteralPath (Join-Path $project 'README.md') -Destination (Join-Path $destination 'README.md') -Force
Get-ChildItem -LiteralPath $destination -Filter '*.exe' | Get-FileHash -Algorithm SHA256 | Select-Object Hash,Path | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $destination 'SHA256.json') -Encoding UTF8
Get-ChildItem -LiteralPath $destination | Select-Object Name,Length
