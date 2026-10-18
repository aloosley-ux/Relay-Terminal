$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $project
$version = (Get-Content -Raw -LiteralPath 'package.json' | ConvertFrom-Json).version
if ($version -notmatch '^5\.\d+\.\d+$') { throw "Expected a Relay 5.x release version, found $version" }
$nativeVersion = (Get-Content -Raw -LiteralPath 'src-tauri\tauri.conf.json' | ConvertFrom-Json).version
$cargoMatch = [regex]::Match((Get-Content -Raw -LiteralPath 'src-tauri\Cargo.toml'), '(?m)^version\s*=\s*"([^"]+)"')
if (-not $cargoMatch.Success) { throw 'Could not read the Rust package version from src-tauri/Cargo.toml' }
$cargoVersion = $cargoMatch.Groups[1].Value
if ($nativeVersion -ne $version -or $cargoVersion -ne $version) { throw "Release versions disagree: package=$version tauri=$nativeVersion cargo=$cargoVersion" }
$exeSource = Join-Path $project 'src-tauri\target\release\relay-terminal.exe'
$setupSource = Join-Path $project "src-tauri\target\release\bundle\nsis\Relay Terminal_${version}_x64-setup.exe"
foreach ($file in @($exeSource, $setupSource)) { if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Release output missing: $file" } }
$release = Join-Path $project "Build\Release-$version"
New-Item -ItemType Directory -Path $release -Force | Out-Null
$releaseFull = [IO.Path]::GetFullPath($release)
$buildFull = [IO.Path]::GetFullPath((Join-Path $project 'Build'))
if (-not $releaseFull.StartsWith($buildFull + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw "Release output escaped Build/: $releaseFull" }
$exeName = "Relay-Terminal_${version}_x64.exe"
$setupName = "Relay-Terminal_${version}_x64-setup.exe"
Copy-Item -LiteralPath $exeSource -Destination (Join-Path $release $exeName) -Force
Copy-Item -LiteralPath $setupSource -Destination (Join-Path $release $setupName) -Force
$releaseNotes = "RELEASE-NOTES-$version.md"
$testReport = "TEST-REPORT-$version.md"
if (-not (Test-Path -LiteralPath $releaseNotes)) { $releaseNotes = "RELEASE-NOTES-$($version.Substring(0,3)).md" }
if (-not (Test-Path -LiteralPath $testReport)) { $testReport = "TEST-REPORT-$($version.Substring(0,3)).md" }
$docs = @('README.md','CHANGELOG.md',$releaseNotes,$testReport,'docs\APPEARANCE-STUDIO.md','docs\media\appearance-studio-5.1.png')
foreach ($document in $docs) { if (Test-Path -LiteralPath $document -PathType Leaf) { Copy-Item -LiteralPath $document -Destination $release -Force } }
& (Join-Path $PSScriptRoot 'verify-windows-icons.ps1') -Executable (Join-Path $release $exeName) -Installer (Join-Path $release $setupName)
$hashes = Get-FileHash -LiteralPath (Join-Path $release $exeName),(Join-Path $release $setupName) -Algorithm SHA256
$hashes | ForEach-Object { '{0}  {1}' -f $_.Hash,[IO.Path]::GetFileName($_.Path) } | Set-Content -LiteralPath (Join-Path $release 'SHA256SUMS.txt') -Encoding ASCII
$metadata = [ordered]@{
    productName = 'Relay Terminal'
    version = $version
    identifier = (Get-Content -Raw -LiteralPath 'src-tauri\tauri.conf.json' | ConvertFrom-Json).identifier
    installer = $setupName
    executable = $exeName
    installerSha256 = ($hashes | Where-Object { [IO.Path]::GetFileName($_.Path) -eq $setupName }).Hash
    executableSha256 = ($hashes | Where-Object { [IO.Path]::GetFileName($_.Path) -eq $exeName }).Hash
    webview2 = 'Microsoft Evergreen bootstrapper; internet required if runtime is missing'
    codeSigned = $false
}
$metadata | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $release 'RELEASE-METADATA.json') -Encoding UTF8
Get-ChildItem -LiteralPath $release -File | Sort-Object Name | Select-Object Name,Length
