param([int]$RootPid, [string]$OutputFile = 'idle-metrics.json')
$ErrorActionPreference = 'Stop'
$all = Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name
$ids = [System.Collections.Generic.HashSet[int]]::new()
[void]$ids.Add($RootPid)
do {
    $changed = $false
    foreach ($p in $all) { if ($ids.Contains([int]$p.ParentProcessId) -and $ids.Add([int]$p.ProcessId)) { $changed=$true } }
} while ($changed)
$before = @{}
foreach ($id in $ids) { $p = Get-Process -Id $id -ErrorAction SilentlyContinue; if ($p) { $before[$id] = $p.TotalProcessorTime.TotalSeconds } }
$watch = [Diagnostics.Stopwatch]::StartNew()
Start-Sleep -Seconds 10
$elapsed = $watch.Elapsed.TotalSeconds
$rows = foreach ($id in $ids) {
    $p = Get-Process -Id $id -ErrorAction SilentlyContinue
    if ($p -and $before.ContainsKey($id)) {
        [PSCustomObject]@{Pid=$id;Name=$p.ProcessName;CpuSeconds=($p.TotalProcessorTime.TotalSeconds-$before[$id]);WorkingSetMB=[math]::Round($p.WorkingSet64/1MB,2);PrivateMB=[math]::Round($p.PrivateMemorySize64/1MB,2)}
    }
}
$cpu = ($rows | Measure-Object -Property CpuSeconds -Sum).Sum
$metrics = [PSCustomObject]@{
    RootPid=$RootPid;SampleSeconds=[math]::Round($elapsed,2);LogicalProcessors=[Environment]::ProcessorCount
    CpuPercentOneCore=[math]::Round($cpu/$elapsed*100,3)
    CpuPercentWholeMachine=[math]::Round($cpu/$elapsed/[Environment]::ProcessorCount*100,3)
    AggregateWorkingSetMB=[math]::Round(($rows | Measure-Object -Property WorkingSetMB -Sum).Sum,2)
    AggregatePrivateMB=[math]::Round(($rows | Measure-Object -Property PrivateMB -Sum).Sum,2)
    Processes=$rows
}
$project = Split-Path $PSScriptRoot -Parent
$metrics | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path (Join-Path $project 'artifacts') $OutputFile)
$metrics | ConvertTo-Json -Depth 6
