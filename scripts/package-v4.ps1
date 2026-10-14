$ErrorActionPreference='Stop'
$project=Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $project
$evidence=Join-Path $project 'Build\Relay-4.0-Evidence'
New-Item -ItemType Directory -Path $evidence -Force | Out-Null
Copy-Item -LiteralPath 'src-tauri\target\release\relay-terminal.exe' -Destination 'Build\Relay Terminal.exe'
Copy-Item -LiteralPath 'src-tauri\target\release\bundle\nsis\Relay Terminal_4.0.0_x64-setup.exe' -Destination 'Build\Relay Terminal_4.0.0_x64-setup.exe'
Copy-Item -LiteralPath 'README.md','RELEASE-NOTES-4.0.md','TEST-REPORT-4.0.md' -Destination $evidence
Copy-Item -LiteralPath 'docs\COMMAND-OUTPUT.md','docs\RESEARCH-4.0.md','docs\PENPOT-4.0.md','docs\design\relay4-command-menu.svg' -Destination $evidence
Get-ChildItem -LiteralPath 'artifacts\relay4' -File | Where-Object Extension -In '.json','.png' | Copy-Item -Destination $evidence
Get-ChildItem -Path 'artifacts\desktop-*-results.json' | Copy-Item -Destination $evidence
Copy-Item -LiteralPath 'artifacts\relay4\installer\install.json','artifacts\relay4\installer\uninstall.json' -Destination $evidence
$hashes=Get-FileHash -LiteralPath 'Build\Relay Terminal.exe','Build\Relay Terminal_4.0.0_x64-setup.exe' -Algorithm SHA256
$hashes | ForEach-Object { $_.Hash+'  '+[IO.Path]::GetFileName($_.Path) } | Set-Content -LiteralPath 'Build\SHA256SUMS-4.0.txt'
$hashes | Format-Table -AutoSize
