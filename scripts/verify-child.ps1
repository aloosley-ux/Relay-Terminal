$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
$recordPath = Join-Path $project 'artifacts\child-close-test.json'
$record = Get-Content -LiteralPath $recordPath -Raw | ConvertFrom-Json
if (Get-Process -Id $record.childPid -ErrorAction SilentlyContinue) { throw "Child process $($record.childPid) survived closing its tab." }
$record.terminationVerified = $true
$record | ConvertTo-Json | Set-Content -LiteralPath $recordPath -Encoding UTF8
Write-Output "PASS: native child $($record.childPid) terminated when its busy terminal tab closed."
