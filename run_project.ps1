
Write-Host "Starting Smart Restaurant System..." -ForegroundColor Green

# Start Backend
Write-Host "Launching Backend Server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '.\.venv\Scripts\Activate.ps1'; cd backend; python manage.py runserver"

# Start Frontend
Write-Host "Launching Frontend Server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "System Started!" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:5173"
