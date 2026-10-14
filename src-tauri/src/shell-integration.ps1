$OutputEncoding = [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$global:__RelayOriginalPrompt = $function:prompt
$global:__RelayCommandActive = $false
function global:prompt {
    $relaySucceeded = $?
    $relayPath = $ExecutionContext.SessionState.Path.CurrentLocation.Path
    $relayEncoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($relayPath))
    $e = [char]27
    if ($global:__RelayCommandActive) {
        [Console]::Write("$e]633;__RELAY_TOKEN__;D" + [char]7)
        $global:__RelayCommandActive = $false
    }
    [Console]::Write("$e]777;__RELAY_TOKEN__;" + $relayEncoded + ';' + [int]$relaySucceeded + [char]7)
    [Console]::Write("$e]633;__RELAY_TOKEN__;P" + [char]7)
    if (__RELAY_LOAD_PROFILES__ -and $global:__RelayOriginalPrompt) {
        return & $global:__RelayOriginalPrompt
    }
    return "$e[38;2;129;173;163m$relayPath$e[0m`r`n$e[38;2;129;173;163m❯$e[0m "
}
# Wrap the line reader, not the Enter key: multiline input, history, completion,
# custom PSReadLine bindings and saved actions all report the accepted command.
# Profile files are never edited. If PSReadLine is unavailable, copying selection
# and scrollback still works; Relay does not guess command boundaries.
try {
    Import-Module PSReadLine -ErrorAction Stop
    $global:__RelayOriginalReadLine = $function:PSConsoleHostReadLine
    function global:PSConsoleHostReadLine {
        $relayLine = & $global:__RelayOriginalReadLine
        if (-not [string]::IsNullOrWhiteSpace($relayLine)) {
            $relayCommand = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($relayLine))
            [Console]::Write(([char]27).ToString() + ']633;__RELAY_TOKEN__;C;' + $relayCommand + [char]7)
            $global:__RelayCommandActive = $true
        }
        return $relayLine
    }
} catch { }
