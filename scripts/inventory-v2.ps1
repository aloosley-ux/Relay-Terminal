$ErrorActionPreference = 'Stop'
Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'relay|conemu' } | Select-Object ProcessId,ParentProcessId,Name,ExecutablePath | ConvertTo-Json -Depth 3
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -ge 9220 -and $_.LocalPort -le 9240 } | Select-Object LocalPort,OwningProcess | ConvertTo-Json
$project = Split-Path $PSScriptRoot -Parent
$backup = Join-Path $project 'artifacts\v1-source'
New-Item -ItemType Directory -Path $backup -Force | Out-Null
foreach ($item in @('src','src-tauri\src','package.json','src-tauri\Cargo.toml','src-tauri\tauri.conf.json')) {
  $dest = Join-Path $backup $item
  New-Item -ItemType Directory -Path (Split-Path $dest -Parent) -Force | Out-Null
  Copy-Item -LiteralPath (Join-Path $project $item) -Destination $dest -Recurse -Force
}
