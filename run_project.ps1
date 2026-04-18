
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   EPOS System - Smart Restaurant           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get the project root directory
$projectRoot = $PSScriptRoot
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"

# Activate virtual environment first
Write-Host "Setting up environment..." -ForegroundColor Yellow
$venvScript = Join-Path $projectRoot ".venv\Scripts\Activate.ps1"
if (!(Test-Path $venvScript)) {
    Write-Host "✗ Virtual environment not found at $venvScript" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "┌─ Backend Server ─────────────────────────────┐" -ForegroundColor Blue
Write-Host "│ Django on http://localhost:8000              │" -ForegroundColor Blue
Write-Host "└──────────────────────────────────────────────┘" -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; & '.\\.venv\Scripts\Activate.ps1'; cd backend; python manage.py runserver"

Write-Host ""
Write-Host "┌─ Frontend Server ────────────────────────────┐" -ForegroundColor Magenta
Write-Host "│ Vite on http://localhost:5173                │" -ForegroundColor Magenta
Write-Host "└──────────────────────────────────────────────┘" -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✓ Both servers are starting!              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "🔧 Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Cyan
Write-Host "  • admin@restaurant.com / admin123" -ForegroundColor Gray
Write-Host "  • waiter@restaurant.com / waiter123" -ForegroundColor Gray
Write-Host "  • chef@restaurant.com / chef123" -ForegroundColor Gray
Write-Host "  • cashier@restaurant.com / cashier123" -ForegroundColor Gray
Write-Host "  • customer@example.com / customer123" -ForegroundColor Gray
Write-Host ""
Write-Host "Loading frontend in your browser..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"
