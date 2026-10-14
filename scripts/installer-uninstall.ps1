$ErrorActionPreference='Stop'
$root=Join-Path (Split-Path $PSScriptRoot -Parent) 'artifacts\relay4\installer'
$install=[IO.Path]::GetFullPath((Join-Path $root 'installed'))
if(!$install.StartsWith([IO.Path]::GetFullPath($root)+[IO.Path]::DirectorySeparatorChar)){throw 'Invalid test target'}
if(Get-Process -Name 'relay-terminal-validation' -ErrorAction SilentlyContinue){throw 'Close validation app before uninstall'}
$p=Start-Process -FilePath (Join-Path $install 'uninstall.exe') -ArgumentList @('/S',"_?=$install") -WindowStyle Hidden -PassThru -Wait
if($p.ExitCode -ne 0){throw "Uninstaller exit $($p.ExitCode)"}
if(Test-Path (Join-Path $install 'relay-terminal-validation.exe')){throw 'Payload survived uninstall'}
$remaining=Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*' | Where-Object DisplayName -eq 'Relay Validation 4'
if($remaining){throw 'Uninstall registry entry remains'}
@{uninstallExit=$p.ExitCode;payloadRemoved=$true;registrationRemoved=$true;profilePreserved=(Test-Path (Join-Path $root 'profile\settings.json'))} | ConvertTo-Json | Set-Content (Join-Path $root 'uninstall.json')
Write-Output 'PASS isolated native install/uninstall; personal Relay installation untouched'
