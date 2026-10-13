param([int]$RelayProcessId, [string]$Label = 'solid', [string]$Output = 'artifacts/appearance-tests/effects.jsonl')
$ErrorActionPreference = 'Stop'
$taskProcesses = @(Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId)
$taskIds = [System.Collections.Generic.HashSet[int]]::new()
[void]$taskIds.Add($RelayProcessId)
do { $taskAdded=$false; foreach($p in $taskProcesses) { if($taskIds.Contains([int]$p.ParentProcessId) -and $taskIds.Add([int]$p.ProcessId)) {$taskAdded=$true} } } while($taskAdded)
$taskBefore=@(Get-Process -Id @($taskIds) -ErrorAction SilentlyContinue)
$taskCpuBefore=($taskBefore | Measure-Object CPU -Sum).Sum
$taskStart=[System.Diagnostics.Stopwatch]::StartNew()
Start-Sleep -Seconds 3
$taskAfter=@(Get-Process -Id @($taskIds) -ErrorAction SilentlyContinue)
$taskSeconds=$taskStart.Elapsed.TotalSeconds
$taskCpuAfter=($taskAfter | Measure-Object CPU -Sum).Sum
$taskGpu=$null
$taskGpuNote=''
try {
    $taskCounters=(Get-Counter '\GPU Engine(*)\Utilization Percentage' -ErrorAction Stop).CounterSamples
    $taskGpuSamples=@($taskCounters | Where-Object { $_.InstanceName -match '^pid_(\d+)_' -and $taskIds.Contains([int]$Matches[1]) })
    if($taskGpuSamples.Count) {$taskGpu=($taskGpuSamples | Measure-Object CookedValue -Sum).Sum} else {$taskGpuNote='No per-process GPU engine samples returned'}
} catch {$taskGpuNote=$_.Exception.Message}
$taskResult=[ordered]@{label=$Label;rootPid=$RelayProcessId;processCount=$taskAfter.Count;seconds=[math]::Round($taskSeconds,2);cpuCorePercent=[math]::Round(100*($taskCpuAfter-$taskCpuBefore)/$taskSeconds,2);workingSetMB=[math]::Round(($taskAfter | Measure-Object WorkingSet64 -Sum).Sum/1MB,2);privateMB=[math]::Round(($taskAfter | Measure-Object PrivateMemorySize64 -Sum).Sum/1MB,2);gpuEnginePercent=$taskGpu;gpuNote=$taskGpuNote}
$taskJson=$taskResult|ConvertTo-Json -Compress
Add-Content -LiteralPath $Output -Value $taskJson
Write-Output $taskJson
