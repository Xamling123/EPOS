# EPOS System - Start Both Servers
# This script starts the Django backend and Vite frontend servers

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   EPOS System - Starting Servers           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get the project root directory
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"

Write-Host "Project Root: $projectRoot" -ForegroundColor Yellow
Write-Host "Backend Dir: $backendDir" -ForegroundColor Yellow
Write-Host "Frontend Dir: $frontendDir" -ForegroundColor Yellow
Write-Host ""

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
$venvScript = Join-Path $projectRoot ".venv\Scripts\Activate.ps1"
if (Test-Path $venvScript) {
    & $venvScript
    Write-Host "✓ Virtual environment activated" -ForegroundColor Green
} else {
    Write-Host "✗ Virtual environment not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Cyan
Write-Host ""

# Start Backend (Django)
Write-Host "┌─ Backend Server ─────────────────────────────┐" -ForegroundColor Blue
Write-Host "│ Starting Django on http://localhost:8000     │" -ForegroundColor Blue
Write-Host "└──────────────────────────────────────────────┘" -ForegroundColor Blue

$backendProcess = Start-Process -FilePath "python" `
    -ArgumentList "manage.py runserver" `
    -WorkingDirectory $backendDir `
    -PassThru `
    -NoNewWindow

Write-Host "✓ Backend started (PID: $($backendProcess.Id))" -ForegroundColor Green
Start-Sleep -Seconds 2

# Start Frontend (Vite)
Write-Host ""
Write-Host "┌─ Frontend Server ────────────────────────────┐" -ForegroundColor Magenta
Write-Host "│ Starting Vite on http://localhost:5173       │" -ForegroundColor Magenta
Write-Host "└──────────────────────────────────────────────┘" -ForegroundColor Magenta

$frontendProcess = Start-Process -FilePath "npm" `
    -ArgumentList "run dev" `
    -WorkingDirectory $frontendDir `
    -PassThru `
    -NoNewWindow

Write-Host "✓ Frontend started (PID: $($frontendProcess.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   Both servers are now running!             ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "🔧 Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "📚 API Docs: http://localhost:8000/admin" -ForegroundColor Yellow
Write-Host ""
Write-Host "Test Accounts:" -ForegroundColor Cyan
Write-Host "  Admin:    admin@restaurant.com / admin123" -ForegroundColor Gray
Write-Host "  Waiter:   waiter@restaurant.com / waiter123" -ForegroundColor Gray
Write-Host "  Chef:     chef@restaurant.com / chef123" -ForegroundColor Gray
Write-Host "  Cashier:  cashier@restaurant.com / cashier123" -ForegroundColor Gray
Write-Host "  Customer: customer@example.com / customer123" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop servers, close both windows or press Ctrl+C in their terminals" -ForegroundColor Yellow
Write-Host ""

# Wait for processes to complete
$backendProcess | Wait-Process
$frontendProcess | Wait-Process
