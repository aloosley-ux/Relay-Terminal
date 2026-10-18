$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
$root = [IO.Path]::GetFullPath((Join-Path $project 'artifacts\appearance-studio-5.1.1-installer-release'))
$install = Join-Path $root 'installed'
$nsis = Join-Path $project 'src-tauri\target\release\nsis\x64'
$template = Join-Path $nsis 'installer.nsi'
$makensis = Join-Path $env:LOCALAPPDATA 'tauri\NSIS\makensis.exe'
$binary = Join-Path $project 'src-tauri\target\release\relay-terminal.exe'
foreach ($path in @($template, $makensis, $binary)) { if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing installer smoke input: $path" } }
foreach ($path in @($root, $install)) {
    $full = [IO.Path]::GetFullPath($path)
    if (-not $full.StartsWith([IO.Path]::GetFullPath((Join-Path $project 'artifacts')) + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw "Unsafe smoke path: $full" }
}
if (Test-Path -LiteralPath $install) { throw "Preserving existing installer smoke directory: $install" }
New-Item -ItemType Directory -Path $root -Force | Out-Null
$source = Get-Content -LiteralPath $template -Raw
$source = $source.Replace('!define PRODUCTNAME "Relay Terminal"', '!define PRODUCTNAME "Relay Studio Validation"')
$source = $source.Replace('!define MAINBINARYNAME "relay-terminal"', '!define MAINBINARYNAME "relay-terminal-validation"')
$source = $source.Replace('!define BUNDLEID "com.relay.terminal"', '!define BUNDLEID "com.relay.validation.appearance51"')
$source = $source.Replace('!define OUTFILE "nsis-output.exe"', ('!define OUTFILE "' + (Join-Path $root 'validation-setup.exe') + '"'))
$source = $source.Replace('File "${MAINBINARYSRCPATH}"', 'File /oname=${MAINBINARYNAME}.exe "${MAINBINARYSRCPATH}"')
foreach ($required in @('!define PRODUCTNAME "Relay Studio Validation"', '!define MAINBINARYNAME "relay-terminal-validation"', '!define BUNDLEID "com.relay.validation.appearance51"', 'File /oname=${MAINBINARYNAME}.exe')) { if (-not $source.Contains($required)) { throw "Could not isolate installer identity: $required" } }
$script = Join-Path $root 'validation.nsi'
[IO.File]::WriteAllText($script, $source)
& $makensis ('/X!addincludedir "' + $nsis + '"') /V2 $script
if ($LASTEXITCODE -ne 0) { throw 'Isolated NSIS compile failed' }
$setup = Start-Process -FilePath (Join-Path $root 'validation-setup.exe') -ArgumentList @('/S', '/NS', "/D=$install") -WindowStyle Hidden -PassThru -Wait
if ($setup.ExitCode -ne 0) { throw "Isolated install exited $($setup.ExitCode)" }
$installedExe = Join-Path $install 'relay-terminal-validation.exe'
if (-not (Test-Path -LiteralPath $installedExe -PathType Leaf)) { throw 'Installer did not place its isolated executable' }
$expected = (Get-FileHash -LiteralPath $binary -Algorithm SHA256).Hash
$installed = (Get-FileHash -LiteralPath $installedExe -Algorithm SHA256).Hash
if ($installed -ne $expected) { throw 'Installed executable differs from the release build' }
$uninstaller = Join-Path $install 'uninstall.exe'
if (-not (Test-Path -LiteralPath $uninstaller -PathType Leaf)) { throw 'Installer did not create its isolated uninstaller' }
$remove = Start-Process -FilePath $uninstaller -ArgumentList @('/S') -WindowStyle Hidden -PassThru -Wait
if ($remove.ExitCode -ne 0) { throw "Isolated uninstall exited $($remove.ExitCode)" }
if (Test-Path -LiteralPath $installedExe) { throw 'Uninstaller left the isolated executable behind' }
@{ installExit = $setup.ExitCode; uninstallExit = $remove.ExitCode; payloadSha256 = $expected; isolatedProduct = 'Relay Studio Validation'; userRelayIdentityUsed = $false } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $root 'result.json')
Write-Output "Isolated NSIS install/uninstall passed; payload SHA-256 $expected"
