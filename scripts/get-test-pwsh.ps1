$ErrorActionPreference = 'Stop'
$root = Join-Path (Split-Path $PSScriptRoot -Parent) 'artifacts\relay4\pwsh'
New-Item -ItemType Directory -Path $root -Force | Out-Null
$release = Invoke-RestMethod 'https://api.github.com/repos/PowerShell/PowerShell/releases/latest'
$asset = $release.assets | Where-Object name -Match '^PowerShell-.*-win-x64.zip$' | Select-Object -First 1
if (!$asset) { throw 'Official portable PowerShell asset not found' }
$zip = Join-Path $root $asset.name
Invoke-WebRequest -UseBasicParsing $asset.browser_download_url -OutFile $zip
if ($asset.digest -and $asset.digest.StartsWith('sha256:')) {
  if ((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLower() -ne $asset.digest.Substring(7)) { throw 'PowerShell asset hash mismatch' }
}
Expand-Archive -LiteralPath $zip -DestinationPath $root -Force
$release.tag_name | Set-Content (Join-Path $root 'VERSION.txt')
Write-Output "Portable PowerShell $($release.tag_name) ready at $root"
