# stop.ps1 — DAA Dashboard: Kill ALL running server processes (frontend + backend)
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "  DAA Dashboard - Stopping    " -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# 1. Kill by window title using taskkill (most reliable for cmd.exe spawned windows)
$titles = @("DAA Backend", "DAA Frontend")
foreach ($title in $titles) {
    $result = & taskkill /F /FI "WINDOWTITLE eq $title" /T 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[STOPPED] Terminal: '$title'" -ForegroundColor Green
    } else {
        Write-Host "[INFO] No window titled '$title' found (may already be gone)" -ForegroundColor DarkGray
    }
}

# 2. Kill by port (8080 = backend, 5500 = frontend)
foreach ($port in @(8080, 5500)) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if (-not $conn) {
        $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    }

    if ($conn) {
        $pids = $conn | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -gt 4 }
        if ($pids) {
            foreach ($p in $pids) {
                $proc = Get-Process -Id $p -ErrorAction SilentlyContinue
                if ($proc) {
                    try {
                        # Kill the process AND all its children
                        $children = Get-CimInstance Win32_Process -Filter "ParentProcessId = $p" -ErrorAction SilentlyContinue
                        foreach ($child in $children) {
                            Stop-Process -Id $child.ProcessId -Force -ErrorAction SilentlyContinue
                        }
                        Stop-Process -Id $p -Force -ErrorAction Stop
                        Write-Host "[STOPPED] $($proc.Name) (PID $p) on port $port" -ForegroundColor Green
                    } catch {
                        Write-Host "[WARN] Could not stop PID $p on port $port" -ForegroundColor Yellow
                    }
                }
            }
        } else {
            Write-Host "[INFO] Port $port only has system/TIME_WAIT connections" -ForegroundColor DarkGray
        }
    } else {
        Write-Host "[INFO] Nothing running on port $port" -ForegroundColor Gray
    }
}

# 3. Sweep for any stray uvicorn or http.server python processes
$strayPython = Get-CimInstance Win32_Process -Filter "Name = 'python.exe' OR Name = 'python3.exe'" -ErrorAction SilentlyContinue
foreach ($proc in $strayPython) {
    $cmdLine = $proc.CommandLine
    if ($cmdLine -match "uvicorn|http\.server|main:app") {
        try {
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop
            Write-Host "[STOPPED] Stray Python process: $($cmdLine.Substring(0, [Math]::Min(80, $cmdLine.Length)))..." -ForegroundColor Green
        } catch {
            Write-Host "[WARN] Could not stop stray PID $($proc.ProcessId)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "All DAA Dashboard servers stopped." -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
