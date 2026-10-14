$ErrorActionPreference='Stop'
$project=Split-Path $PSScriptRoot -Parent
$root=Join-Path $project 'artifacts\relay4\installer'
$install=Join-Path $root 'installed'
$nsis=Join-Path $project 'src-tauri\target\release\nsis\x64'
New-Item -ItemType Directory -Path $root -Force | Out-Null
# Exercise the generated installer with an isolated identity. The installed
# payload is byte-identical; the user's existing Relay installation is untouched.
$source=Get-Content -LiteralPath (Join-Path $nsis 'installer.nsi') -Raw
$source=$source.Replace('!define PRODUCTNAME "Relay Terminal"','!define PRODUCTNAME "Relay Validation 4"').Replace('!define MAINBINARYNAME "relay-terminal"','!define MAINBINARYNAME "relay-terminal-validation"').Replace('!define BUNDLEID "com.relay.terminal"','!define BUNDLEID "com.relay.validation4"').Replace('!define OUTFILE "nsis-output.exe"',('!define OUTFILE "'+(Join-Path $root 'validation-setup.exe')+'"'))
$script=Join-Path $nsis 'validation.nsi'
$source=$source.Replace('File "${MAINBINARYSRCPATH}"','File /oname=${MAINBINARYNAME}.exe "${MAINBINARYSRCPATH}"')
[IO.File]::WriteAllText($script,$source)
& "$env:LOCALAPPDATA\tauri\NSIS\makensis.exe" /V2 $script
if($LASTEXITCODE -ne 0){throw 'Isolated NSIS compilation failed'}
$p=Start-Process -FilePath (Join-Path $root 'validation-setup.exe') -ArgumentList @('/S','/NS',"/D=$install") -WindowStyle Hidden -PassThru -Wait
if($p.ExitCode -ne 0){throw "Installer exit $($p.ExitCode)"}
$exe=Join-Path $install 'relay-terminal-validation.exe'
$expected=(Get-FileHash -LiteralPath (Join-Path $project 'src-tauri\target\release\relay-terminal.exe')).Hash
if((Get-FileHash -LiteralPath $exe).Hash -ne $expected){throw 'Installed payload mismatch'}
$env:RELAY_DATA_DIR=Join-Path $root 'profile'
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS='--remote-debugging-port=9249 --remote-debugging-address=127.0.0.1'
$app=Start-Process -FilePath $exe -WindowStyle Hidden -PassThru
$app.Id | Set-Content (Join-Path $root 'pid.txt')
@{phase='installed';payloadSha256=$expected;installExit=$p.ExitCode;pid=$app.Id;note='Generated NSIS installer with isolated product and binary identity'} | ConvertTo-Json | Set-Content (Join-Path $root 'install.json')
Write-Output "Installed identical payload; validation app PID $($app.Id), CDP 9249. Run command-native.mjs, close it, then installer-uninstall.ps1."
