param([string]$Executable='artifacts\relay4\relay-terminal-candidate.exe',[int]$Port=9245,[string]$Profile='artifacts\relay4\pwsh-profile')
$env:PATH=(Join-Path (Split-Path $PSScriptRoot -Parent) 'artifacts\relay4\pwsh')+';'+$env:PATH
& "$PSScriptRoot\launch-v2.ps1" -Executable $Executable -Port $Port -Profile $Profile
