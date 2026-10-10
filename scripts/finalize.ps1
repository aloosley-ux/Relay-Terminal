$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
$build = Join-Path $project 'Build'
Copy-Item -LiteralPath (Join-Path $project 'TEST-REPORT.md') -Destination $build -Force
Copy-Item -LiteralPath (Join-Path $project 'REA-FINDINGS.md') -Destination $build -Force
$screenshots = Join-Path $build 'Screenshots'
New-Item -ItemType Directory -Path $screenshots -Force | Out-Null
foreach ($name in @('relay-dark-1920x1080.png','relay-light-1366x768.png','relay-folder-browser.png')) {
    Copy-Item -LiteralPath (Join-Path $project "artifacts\screenshots\$name") -Destination $screenshots -Force
}
Get-ChildItem -LiteralPath $build -Filter '*.exe' | Get-FileHash -Algorithm SHA256 | Select-Object Hash,Path | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $build 'SHA256.json') -Encoding UTF8
$expected = Get-FileHash -LiteralPath (Join-Path $project 'src-tauri\target\release\relay-terminal.exe') -Algorithm SHA256
$actual = Get-FileHash -LiteralPath (Join-Path $build 'Relay Terminal.exe') -Algorithm SHA256
if ($expected.Hash -ne $actual.Hash) { throw 'Portable executable differs from the tested release build.' }
$results = Get-Content -LiteralPath (Join-Path $project 'artifacts\gui-test-results.json') -Raw | ConvertFrom-Json
Write-Output "GUI checks: $($results.results.Count); page errors: $($results.pageErrors.Count)"
Write-Output "Portable executable SHA-256: $($actual.Hash)"
Get-ChildItem -LiteralPath $build | Select-Object Name,Length
if (Test-Path -LiteralPath (Join-Path $project 'rustup-init.exe')) { Remove-Item -LiteralPath (Join-Path $project 'rustup-init.exe') }
