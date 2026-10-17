$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $project
$version = (Get-Content -Raw -LiteralPath 'package.json' | ConvertFrom-Json).version
if ($version -ne '5.0.0') { throw "Expected Relay 5.0.0, found $version" }
$identifier = (Get-Content -Raw -LiteralPath 'src-tauri\tauri.conf.json' | ConvertFrom-Json).identifier
if ($identifier -ne 'com.relay.terminal') { throw "Unexpected Windows application identity: $identifier" }
$exeSource = Join-Path $project 'src-tauri\target\release\relay-terminal.exe'
$setupSource = Join-Path $project "src-tauri\target\release\bundle\nsis\Relay Terminal_${version}_x64-setup.exe"
foreach ($file in @($exeSource, $setupSource)) { if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Release output missing: $file" } }
$release = Join-Path $project 'Build\Release-5.0.0'
New-Item -ItemType Directory -Path $release -Force | Out-Null
$releaseFull = [IO.Path]::GetFullPath($release)
$buildFull = [IO.Path]::GetFullPath((Join-Path $project 'Build'))
if (-not $releaseFull.StartsWith($buildFull + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw "Release output escaped Build/: $releaseFull" }
$legacySetup = Join-Path $release 'Relay-Terminal-5.0.0-Setup.exe'
if (Test-Path -LiteralPath $legacySetup -PathType Leaf) {
    $archive = Join-Path $project 'Build\Archive\Pre-release-5.0.0'
    New-Item -ItemType Directory -Path $archive -Force | Out-Null
    $archiveFull = [IO.Path]::GetFullPath($archive)
    if (-not $archiveFull.StartsWith($buildFull + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw "Archive output escaped Build/: $archiveFull" }
    $archivedSetup = Join-Path $archive 'Relay-Terminal-5.0.0-Setup.exe'
    if (Test-Path -LiteralPath $archivedSetup) { throw "Pre-release installer archive already exists: $archivedSetup" }
    Move-Item -LiteralPath $legacySetup -Destination $archivedSetup
}
$exeName = "Relay-Terminal_${version}_x64.exe"
$setupName = "Relay-Terminal_${version}_x64-setup.exe"
Copy-Item -LiteralPath $exeSource -Destination (Join-Path $release $exeName) -Force
Copy-Item -LiteralPath $setupSource -Destination (Join-Path $release $setupName) -Force
Copy-Item -LiteralPath 'README.md','RELEASE-NOTES-5.0.md','TEST-REPORT-5.0.md' -Destination $release -Force
& (Join-Path $PSScriptRoot 'verify-windows-icons.ps1') -Executable (Join-Path $release $exeName) -Installer (Join-Path $release $setupName)
$hashes = Get-FileHash -LiteralPath (Join-Path $release $exeName),(Join-Path $release $setupName) -Algorithm SHA256
$hashes | ForEach-Object { '{0}  {1}' -f $_.Hash,[IO.Path]::GetFileName($_.Path) } | Set-Content -LiteralPath (Join-Path $release 'SHA256SUMS.txt') -Encoding ASCII
$metadata = [ordered]@{
    productName = 'Relay Terminal'
    version = $version
    identifier = $identifier
    installer = $setupName
    executable = $exeName
    installerSha256 = ($hashes | Where-Object { [IO.Path]::GetFileName($_.Path) -eq $setupName }).Hash
    executableSha256 = ($hashes | Where-Object { [IO.Path]::GetFileName($_.Path) -eq $exeName }).Hash
    webview2 = 'Microsoft Evergreen bootstrapper; internet required if runtime is missing'
    codeSigned = $false
}
$metadata | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $release 'RELEASE-METADATA.json') -Encoding UTF8
Get-ChildItem -LiteralPath $release -File | Sort-Object Name | Select-Object Name,Length
