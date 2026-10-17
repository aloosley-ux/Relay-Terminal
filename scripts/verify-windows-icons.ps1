param(
    [Parameter(Mandatory=$true)][string]$Executable,
    [Parameter(Mandatory=$true)][string]$Installer,
    [string]$Icon = 'src-tauri\icons\icon.ico',
    [string]$ExpectedSmallIcon = 'src-tauri\icons\32x32.png',
    [string]$DiagnosticDirectory = ''
)
$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $project
$iconPath = [IO.Path]::GetFullPath($Icon)
$expectedPath = [IO.Path]::GetFullPath($ExpectedSmallIcon)
foreach ($file in @($iconPath,$expectedPath,$Executable,$Installer)) {
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Missing Windows icon verification input: $file" }
}
$reader = [IO.BinaryReader]::new([IO.File]::OpenRead($iconPath))
try {
    if ($reader.ReadUInt16() -ne 0 -or $reader.ReadUInt16() -ne 1) { throw 'The source file is not a Windows ICO.' }
    $count = $reader.ReadUInt16()
    $sizes = @()
    for ($i=0; $i -lt $count; $i++) {
        $width = $reader.ReadByte(); $height = $reader.ReadByte()
        [void]$reader.ReadBytes(14)
        $sizes += ('{0}x{1}' -f $(if($width -eq 0){256}else{$width}),$(if($height -eq 0){256}else{$height}))
    }
} finally { $reader.Dispose() }
foreach ($required in @('16x16','32x32','48x48','256x256')) {
    if ($sizes -notcontains $required) { throw "Source ICO is missing required Windows size $required. Found: $($sizes -join ', ')" }
}
Add-Type -AssemblyName System.Drawing
function Get-IconPixels([System.Drawing.Icon]$Value) {
    $bitmap = $Value.ToBitmap()
    try {
        $scaled = [System.Drawing.Bitmap]::new(32,32,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        try {
            $graphics = [System.Drawing.Graphics]::FromImage($scaled)
            try { $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic; $graphics.DrawImage($bitmap,0,0,32,32) }
            finally { $graphics.Dispose() }
            $pixels = [byte[]]::new(32*32*4); $offset=0
            for ($y=0; $y -lt 32; $y++) { for ($x=0; $x -lt 32; $x++) { $c=$scaled.GetPixel($x,$y); $pixels[$offset++]=$c.A; $pixels[$offset++]=$c.R; $pixels[$offset++]=$c.G; $pixels[$offset++]=$c.B } }
            return $pixels
        } finally { $scaled.Dispose() }
    } finally { $bitmap.Dispose() }
}
$expected = [System.Drawing.Image]::FromFile($expectedPath)
try {
    $scaledExpected = [System.Drawing.Bitmap]::new(32,32,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
        $graphics = [System.Drawing.Graphics]::FromImage($scaledExpected)
        try { $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic; $graphics.DrawImage($expected,0,0,32,32) }
        finally { $graphics.Dispose() }
        $expectedPixels = [byte[]]::new(32*32*4); $offset=0
        for ($y=0; $y -lt 32; $y++) { for ($x=0; $x -lt 32; $x++) { $c=$scaledExpected.GetPixel($x,$y); $expectedPixels[$offset++]=$c.A; $expectedPixels[$offset++]=$c.R; $expectedPixels[$offset++]=$c.G; $expectedPixels[$offset++]=$c.B } }
        if ($DiagnosticDirectory) { New-Item -ItemType Directory -Path $DiagnosticDirectory -Force | Out-Null; $scaledExpected.Save((Join-Path $DiagnosticDirectory 'source.png'),[System.Drawing.Imaging.ImageFormat]::Png) }
    } finally { $scaledExpected.Dispose() }
} finally { $expected.Dispose() }
$results = @()
$failures = @()
foreach ($path in @($Executable,$Installer)) {
    $full = [IO.Path]::GetFullPath($path)
    $actual = [System.Drawing.Icon]::ExtractAssociatedIcon($full)
    if ($null -eq $actual) { throw "Windows could not load an associated icon from $full" }
    try {
        $actualPixels = Get-IconPixels $actual
        if ($DiagnosticDirectory) { $leaf = [IO.Path]::GetFileNameWithoutExtension($full); $actual.ToBitmap().Save((Join-Path $DiagnosticDirectory ($leaf + '.png')),[System.Drawing.Imaging.ImageFormat]::Png) }
    } finally { $actual.Dispose() }
    $same = 0
    for ($i=0; $i -lt $expectedPixels.Length; $i+=4) {
        if ($expectedPixels[$i] -eq $actualPixels[$i] -and $expectedPixels[$i+1] -eq $actualPixels[$i+1] -and $expectedPixels[$i+2] -eq $actualPixels[$i+2] -and $expectedPixels[$i+3] -eq $actualPixels[$i+3]) { $same++ }
    }
    $similarity = [Math]::Round($same / 1024,4)
    if ($similarity -lt 0.94) { $failures += "Windows file icon for $full does not match the accepted Relay icon ($similarity)." }
    $results += [ordered]@{ path=$full; iconMatchesRelay=($similarity -ge 0.94); pixelMatch=$similarity }
}
if ($failures.Count) { throw ($failures -join [Environment]::NewLine) }
[ordered]@{ source=$iconPath; sizes=$sizes; executable=$results[0]; installer=$results[1] } | ConvertTo-Json -Depth 5
