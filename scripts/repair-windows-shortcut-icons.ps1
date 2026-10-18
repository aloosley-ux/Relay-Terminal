# Repairs Windows shortcut icon references after upgrading Relay Terminal.
# The executable already has the correct embedded icon; Windows may retain a
# cached icon for an older pinned shortcut. Does NOT restart Explorer or the app.
[CmdletBinding(SupportsShouldProcess)]
param()

$ErrorActionPreference='Stop'
$exe=Join-Path $env:LOCALAPPDATA 'Relay Terminal\relay-terminal.exe'
if (-not (Test-Path -LiteralPath $exe -PathType Leaf)) {
  throw "Relay installation not found: $exe"
}
$wsh=New-Object -ComObject WScript.Shell
$shortcuts=@(
  (Join-Path $env:APPDATA 'Microsoft\Internet Explorer\Quick Launch\User Pinned\TaskBar\Relay Terminal.lnk'),
  (Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Relay Terminal.lnk')
)
$backupDir=Join-Path $env:LOCALAPPDATA 'Relay Terminal\Shortcut-Backups'
foreach($path in $shortcuts) {
 if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
   Write-Warning "Skipping absent shortcut: $path"
   continue
 }
 $shortcut=$wsh.CreateShortcut($path)
 if ([IO.Path]::GetFullPath($shortcut.TargetPath) -ne [IO.Path]::GetFullPath($exe)) {
   Write-Warning "Skipping shortcut with unexpected target: $path"
   continue
 }
 $newIcon="$exe,0"
 if ($shortcut.IconLocation -eq $newIcon) {
   Write-Output "Already correct: $path"
   continue
 }
 if ($PSCmdlet.ShouldProcess($path,'Set explicit installed Relay icon')) {
   New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
   $suffix= if ($path -like '*User Pinned*') { 'taskbar' } else { 'start-menu' }
   $dest=Join-Path $backupDir ('Relay-Terminal-'+$suffix+'-'+(Get-Date -Format 'yyyyMMdd-HHmmss')+'.lnk')
   Copy-Item -LiteralPath $path -Destination $dest -ErrorAction Stop
   $shortcut.IconLocation=$newIcon
   $shortcut.Save()
   $verify=$wsh.CreateShortcut($path)
   if ($verify.IconLocation -ne $newIcon) { throw "Failed to save shortcut icon: $path" }
   Write-Output "Updated: $path"
 }
}
if (-not $WhatIfPreference) {
 Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class RelayIconRefresh {
 [DllImport("shell32.dll")]
 public static extern void SHChangeNotify(int eventId, int flags, IntPtr item1, IntPtr item2);
}
'@
 [RelayIconRefresh]::SHChangeNotify(0x08000000,0,[IntPtr]::Zero,[IntPtr]::Zero)
 $refresh=Join-Path $env:WINDIR 'System32\ie4uinit.exe'
 if (Test-Path -LiteralPath $refresh) { & $refresh -show }
 Write-Output 'Requested Windows shell icon refresh; no Explorer restart.'
 Write-Output 'If the taskbar still shows its old cached graphic, unpin the old Relay shortcut and pin Relay Terminal again from Start.'
}
