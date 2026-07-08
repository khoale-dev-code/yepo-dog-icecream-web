$port = 4000

$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
  Where-Object {
    $_.OwningProcess -gt 0 -and
    ($_.State -eq "Listen" -or $_.State -eq "Established")
  }

if (-not $connections) {
  Write-Host "Port $port is already free or only has system/idle entries."
  exit 0
}

$processIds = $connections.OwningProcess | Sort-Object -Unique

foreach ($processId in $processIds) {
  try {
    $process = Get-Process -Id $processId -ErrorAction Stop

    Write-Host "Killing PID $processId ($($process.ProcessName)) on port $port"

    Stop-Process -Id $processId -Force -ErrorAction Stop
  } catch {
    Write-Host "Skip PID $processId because it cannot be stopped: $($_.Exception.Message)"
  }
}
