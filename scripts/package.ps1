$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
$destination = Join-Path $project 'Build'
New-Item -ItemType Directory -Path $destination -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $project 'src-tauri\target\release\relay-terminal.exe') -Destination (Join-Path $destination 'Relay Terminal.exe') -Force
$version = (Get-Content -Raw -LiteralPath (Join-Path $project 'package.json') | ConvertFrom-Json).version
Copy-Item -LiteralPath (Join-Path $project "src-tauri\target\release\bundle\nsis\Relay Terminal_${version}_x64-setup.exe") -Destination $destination -Force
Copy-Item -LiteralPath (Join-Path $project 'README.md') -Destination (Join-Path $destination 'README.md') -Force
$releaseLabel = (($version -split '\.')[0..1] -join '.')
foreach ($document in @("RELEASE-NOTES-$releaseLabel.md", "TEST-REPORT-$releaseLabel.md")) {
    Copy-Item -LiteralPath (Join-Path $project $document) -Destination $destination -Force
}
$packageDocs = Join-Path $destination 'docs'
New-Item -ItemType Directory -Path $packageDocs -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $project 'docs\DESIGN-2.1.md') -Destination $packageDocs -Force
Copy-Item -LiteralPath (Join-Path $project 'docs\media') -Destination $packageDocs -Recurse -Force
$packageExecutables = @((Join-Path $destination 'Relay Terminal.exe'), (Join-Path $destination "Relay Terminal_${version}_x64-setup.exe"))
Get-FileHash -LiteralPath $packageExecutables -Algorithm SHA256 | Select-Object Hash,Path | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $destination 'SHA256.json') -Encoding UTF8
Get-ChildItem -LiteralPath $destination | Select-Object Name,Length
