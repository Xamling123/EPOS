# EPOS System - Quick Start Guide

## ⚡ Quick Start (Recommended)

### One-Click Startup
1. **Open PowerShell** in the project root folder
2. **Run this command:**
   ```powershell
   .\run_project.ps1
   ```
3. **Wait 5-10 seconds** - two new windows will open
4. **Frontend automatically opens** at `http://localhost:5173`

That's it! Both servers should be running.

---

## 🔧 Manual Startup (If Needed)

### Terminal 1 - Backend Server
```powershell
cd backend
python manage.py runserver
```

**You should see:**
```
Starting development server at http://127.0.0.1:8000/
```

### Terminal 2 - Frontend Server
```powershell
cd frontend
npm run dev
```

**You should see:**
```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
```

---

## 🚫 Network Error? Troubleshoot Here

### Check 1: Are both servers running?

Run this command in a new PowerShell window:
```powershell
node check_servers.js
```

This will tell you which servers are up and which are down.

---

### Problem: Backend shows error

**Error:** `ModuleNotFoundError` or `No module named...`

**Solution:**
```powershell
cd backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

### Problem: Frontend shows error

**Error:** `npm: command not found` or `ERR!`

**Solution:**
```powershell
cd frontend
npm install
npm run dev
```

---

### Problem: Port already in use

**Error:** `Port 8000 already in use` or `Port 5173 already in use`

Find what process is using the port:

**For Backend (Port 8000):**
```powershell
netstat -ano | findstr :8000
```

Then kill the process:
```powershell
taskkill /PID [PROCESS_ID] /F
```

**For Frontend (Port 5173):**
```powershell
netstat -ano | findstr :5173
taskkill /PID [PROCESS_ID] /F
```

---

### Problem: Still getting Network Error

1. **Verify Backend URL** in frontend:
   - Check `frontend/.env` contains: `VITE_API_URL=http://localhost:8000/api`

2. **Check CORS is enabled** in backend:
   - Verify `backend/restaurant_api/settings.py` has `CORS_ALLOW_ALL_ORIGINS = True`

3. **Restart everything:**
   - Close all terminals
   - Close all PowerShell windows
   - Run `.\run_project.ps1` again
   - Wait full 10 seconds before trying to login

4. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for detailed error messages

---

## 🔐 Test Credentials

Use any of these accounts to login:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@restaurant.com | admin123 |
| Waiter | waiter@restaurant.com | waiter123 |
| Chef | chef@restaurant.com | chef123 |
| Cashier | cashier@restaurant.com | cashier123 |
| Customer | customer@example.com | customer123 |

---

## 📱 URLs After Startup

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| Django Admin | http://localhost:8000/admin |
| API Docs | http://localhost:8000/api/ |
| Login | http://localhost:5173/login |

---

## 💡 Pro Tips

1. **Keep terminals open** - Don't close the PowerShell windows while working
2. **Check browser console** (F12) for detailed error messages
3. **Hard refresh** browser (Ctrl+Shift+R) if you see old version
4. **Clear localStorage** if you get stuck: DevTools → Application → Local Storage → Delete

---

## 🚨 Still Have Issues?

Check this order:
1. ✓ Backend running? (Check port 8000)
2. ✓ Frontend running? (Check port 5173)
3. ✓ Both connected to each other?
4. ✓ Database migrated? (Check `backend/db.sqlite3` exists)
5. ✓ Test accounts exist? (Check Django admin)

Run the status checker:
```powershell
node check_servers.js
```

Then run diagnostic:
```powershell
cd backend
python verify_system.py
```
