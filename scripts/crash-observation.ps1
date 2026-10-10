$ErrorActionPreference = 'Continue'
Get-WinEvent -FilterHashtable @{LogName='Application';StartTime=(Get-Date).AddMinutes(-15)} -MaxEvents 15 | Where-Object { $_.ProviderName -match 'Application Error|Windows Error Reporting' } | Select-Object TimeCreated,Message | Format-List
Get-Process -Name relay-terminal,'Relay Terminal' -ErrorAction SilentlyContinue | Select-Object Id,Path,MainWindowTitle
