$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
$root = [IO.Path]::GetFullPath((Join-Path $project 'artifacts\relay4\upgrade-smoke-pass3'))
$install = Join-Path $root 'installed'
$profile = Join-Path $root 'profile'
$nsis = Join-Path $project 'src-tauri\target\release\nsis\x64'
$templatePath = Join-Path $nsis 'installer.nsi'
$makensis = Join-Path $env:LOCALAPPDATA 'tauri\NSIS\makensis.exe'
$v4exe = Join-Path $project 'Build\Release-4.0.0\Relay-Terminal_4.0.0_x64.exe'
$v5exe = Join-Path $project 'src-tauri\target\release\relay-terminal.exe'
foreach ($path in @($templatePath, $makensis, $v4exe, $v5exe)) { if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing upgrade test input: $path" } }
New-Item -ItemType Directory -Path $root -Force | Out-Null

function Build-IsolatedInstaller([string]$Version, [string]$Binary, [string]$Output) {
    $source = Get-Content -LiteralPath $templatePath -Raw
    $source = $source.Replace('!define PRODUCTNAME "Relay Terminal"', '!define PRODUCTNAME "Relay Upgrade Validation"')
    $source = $source.Replace('!define VERSION "5.0.0"', "!define VERSION `"$Version`"")
    $source = $source.Replace('!define VERSIONWITHBUILD "5.0.0.0"', "!define VERSIONWITHBUILD `"$Version.0`"")
    $source = $source.Replace('!define MAINBINARYNAME "relay-terminal"', '!define MAINBINARYNAME "relay-terminal-upgrade-validation"')
    $source = $source.Replace('!define BUNDLEID "com.relay.terminal"', '!define BUNDLEID "com.relay.validation.upgrade"')
    $source = $source.Replace('!define OUTFILE "nsis-output.exe"', ('!define OUTFILE "' + $Output + '"'))
    $source = [regex]::Replace($source, '(?m)(!define MAINBINARYSRCPATH\s*)"[^"]+"', ('$1"' + $Binary + '"'))
    $source = $source.Replace('File "${MAINBINARYSRCPATH}"', 'File /oname=${MAINBINARYNAME}.exe "${MAINBINARYSRCPATH}"')
    $script = Join-Path $nsis "installer-upgrade-validation-$Version.nsi"
    [IO.File]::WriteAllText($script, $source)
    & $makensis /V2 $script
    if ($LASTEXITCODE -ne 0) { throw "Isolated Relay $Version installer compilation failed" }
}

$v4setup = Join-Path $root 'relay-4.0.0-validation-setup.exe'
$v5setup = Join-Path $root 'relay-5.0.0-validation-setup.exe'
Build-IsolatedInstaller '4.0.0' $v4exe $v4setup
Build-IsolatedInstaller '5.0.0' $v5exe $v5setup

foreach ($path in @($install, $profile)) {
    $full = [IO.Path]::GetFullPath($path)
    if (-not $full.StartsWith($root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw "Unsafe isolated path: $full" }
}
if (Test-Path -LiteralPath $install) { throw 'Upgrade smoke install target already exists; preserving it for review' }

$install4 = Start-Process -FilePath $v4setup -ArgumentList @('/S', '/NS', "/D=$install") -WindowStyle Hidden -PassThru -Wait
if ($install4.ExitCode -ne 0) { throw "Relay 4.0 isolated install exit $($install4.ExitCode)" }
$installedExe = Join-Path $install 'relay-terminal-upgrade-validation.exe'
if ((Get-FileHash -LiteralPath $installedExe).Hash -ne (Get-FileHash -LiteralPath $v4exe).Hash) { throw 'Relay 4.0 installed payload mismatch' }

$env:RELAY_DATA_DIR = $profile
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = '--remote-debugging-port=9250 --remote-debugging-address=127.0.0.1'
$app4 = Start-Process -FilePath $installedExe -WindowStyle Hidden -PassThru
$app4.Id | Set-Content -LiteralPath (Join-Path $root 'app4-pid.txt')
$settings = Join-Path $profile 'settings.json'
$deadline = [DateTime]::UtcNow.AddSeconds(45)
while (-not (Test-Path -LiteralPath $settings) -and [DateTime]::UtcNow -lt $deadline) { Start-Sleep -Milliseconds 250 }
if (-not (Test-Path -LiteralPath $settings)) { throw 'Relay 4.0 did not create its isolated settings file' }
if (-not (Get-NetTCPConnection -LocalPort 9250 -State Listen -ErrorAction SilentlyContinue)) { throw 'Relay 4.0 native test endpoint did not start' }

$data = Get-Content -LiteralPath $settings -Raw | ConvertFrom-Json
$data.actions = @($data.actions | Where-Object id -ne 'upgrade-retention-marker') + @([ordered]@{
    id = 'upgrade-retention-marker'; name = 'Upgrade retention marker'; icon = 'terminal'
    description = 'Isolated 4.0 to 5.0 settings retention fixture'
    command = 'Write-Output "UPGRADE_SETTING_RETAINED"'; directory = ''; favorite = $true
})
$data.panelOpen = $true
[IO.File]::WriteAllText($settings, ($data | ConvertTo-Json -Depth 30), [Text.UTF8Encoding]::new($false))
$settingsHashBefore = (Get-FileHash -LiteralPath $settings -Algorithm SHA256).Hash
Stop-Process -Id $app4.Id -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

$install5 = Start-Process -FilePath $v5setup -ArgumentList @('/S', '/NS', "/D=$install") -WindowStyle Hidden -PassThru -Wait
if ($install5.ExitCode -ne 0) { throw "Relay 5.0 isolated upgrade install exit $($install5.ExitCode)" }
if ((Get-FileHash -LiteralPath $installedExe).Hash -ne (Get-FileHash -LiteralPath $v5exe).Hash) { throw 'Relay 5.0 upgrade payload mismatch' }
$settingsHashAfter = (Get-FileHash -LiteralPath $settings -Algorithm SHA256).Hash
if ($settingsHashAfter -ne $settingsHashBefore) { throw 'Installer modified Relay 4.0 settings during upgrade' }

$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = '--remote-debugging-port=9250 --remote-debugging-address=127.0.0.1'
$app5 = Start-Process -FilePath $installedExe -WindowStyle Hidden -PassThru
$app5.Id | Set-Content -LiteralPath (Join-Path $root 'app5-pid.txt')
$deadline = [DateTime]::UtcNow.AddSeconds(45)
while (-not (Get-NetTCPConnection -LocalPort 9250 -State Listen -ErrorAction SilentlyContinue) -and [DateTime]::UtcNow -lt $deadline) { Start-Sleep -Milliseconds 250 }
if (-not (Get-NetTCPConnection -LocalPort 9250 -State Listen -ErrorAction SilentlyContinue)) { throw 'Relay 5.0 upgraded app native test endpoint did not start' }
& rtk node (Join-Path $PSScriptRoot 'installer-upgrade-check.mjs') 9250
if ($LASTEXITCODE -ne 0) { throw 'Relay 5.0 did not load the retained settings fixture' }
Stop-Process -Id $app5.Id -Force -ErrorAction SilentlyContinue

@{
    from = '4.0.0'; to = '5.0.0'; isolatedIdentity = 'com.relay.validation.upgrade'
    v4PayloadSha256 = (Get-FileHash -LiteralPath $v4exe).Hash
    v5PayloadSha256 = (Get-FileHash -LiteralPath $v5exe).Hash
    settingsSha256BeforeUpgrade = $settingsHashBefore
    settingsSha256AfterInstall = $settingsHashAfter
    markerLoadedByV5 = $true
    actualRelayInstallationTouched = $false
} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $root 'upgrade-report.json') -Encoding UTF8
Write-Output 'PASS isolated Relay 4.0 to 5.0 NSIS upgrade retained the settings file and loaded its fixture in the 5.0 app'
