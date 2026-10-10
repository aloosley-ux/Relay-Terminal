$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
$build = Join-Path $project 'Build'
$regression = Get-Content -LiteralPath (Join-Path $project 'artifacts\v2-regression-results.json') -Raw | ConvertFrom-Json
$acceptance = Get-Content -LiteralPath (Join-Path $project 'artifacts\v2-acceptance.json') -Raw | ConvertFrom-Json
$focus = Get-Content -LiteralPath (Join-Path $project 'artifacts\v2-focus-acceptance.json') -Raw | ConvertFrom-Json
$child = Get-Content -LiteralPath (Join-Path $project 'artifacts\child-close-test.json') -Raw | ConvertFrom-Json
if ($regression.results.Count -ne 22 -or $regression.pageErrors.Count -ne 0 -or $acceptance.results.Count -ne 16 -or $acceptance.errors.Count -ne 0 -or -not $focus.passed -or -not $child.terminationVerified) { throw 'Release verification records are incomplete.' }
$archive = Join-Path $build 'Archive'
New-Item -ItemType Directory -Path $archive -Force | Out-Null
$previous = Join-Path $build 'Relay Terminal.exe'
$backup = Join-Path $archive 'Relay Terminal 1.0.exe'
if ((Test-Path -LiteralPath $previous) -and -not (Test-Path -LiteralPath $backup)) { Copy-Item -LiteralPath $previous -Destination $backup }
& (Join-Path $PSScriptRoot 'package.ps1')
foreach ($name in @('TEST-REPORT-2.0.md','RELEASE-NOTES-2.0.md')) { Copy-Item -LiteralPath (Join-Path $project $name) -Destination $build -Force }
$shots = Join-Path $build 'Screenshots'
New-Item -ItemType Directory -Path $shots -Force | Out-Null
foreach ($name in @('relay-2-terminal.png','relay-2-projects.png','relay-2-files.png','relay-2-cortana.png','relay-2-processes.png','v2-projects-light.png','v2-compact-light.png')) { Copy-Item -LiteralPath (Join-Path $project "artifacts\screenshots\$name") -Destination $shots -Force }
$sourceHash = (Get-FileHash -LiteralPath (Join-Path $project 'src-tauri\target\release\relay-terminal.exe') -Algorithm SHA256).Hash
$buildHash = (Get-FileHash -LiteralPath (Join-Path $build 'Relay Terminal.exe') -Algorithm SHA256).Hash
if ($sourceHash -ne $buildHash) { throw 'Packaged executable differs from tested release.' }
Write-Output "VERIFIED: 22 regressions, 16 new acceptance groups, focused keyboard checks and child cleanup."
Write-Output "Tested portable SHA-256: $buildHash"
Get-Process -Id 3600 -ErrorAction Stop | Select-Object Id,Path
