# Smart Restaurant Reservation & Pre-Order System (EPOS Integrated)

## Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8.0 (optional - SQLite works for development)

---

## Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux

# Run migrations
python manage.py migrate

# Seed the database with sample data
python manage.py shell < seeds/seed_data.py

# Run development server
python manage.py runserver
```

Backend runs at: **http://localhost:8000**

---

## Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Demo Accounts

| Role     | Email                    | Password    |
|----------|--------------------------|-------------|
| Admin    | admin@restaurant.com     | admin123    |
| Waiter   | waiter@restaurant.com    | waiter123   |
| Chef     | chef@restaurant.com      | chef123     |
| Cashier  | cashier@restaurant.com   | cashier123  |
| Customer | customer@example.com     | customer123 |

---

## Environment Variables

### Backend (.env)
```
DEBUG=True
SECRET_KEY=change-this-in-production
USE_SQLITE=True
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

---

## Running Tests

```bash
cd backend
python manage.py test tests -v 2
```

---

## API Endpoints Summary

| Endpoint                        | Method | Description                    |
|---------------------------------|--------|--------------------------------|
| `/api/auth/register/`           | POST   | Customer registration          |
| `/api/auth/login/`              | POST   | Login, get JWT tokens          |
| `/api/tables/`                  | GET    | List all tables                |
| `/api/tables/availability/`     | POST   | Check table availability       |
| `/api/reservations/`            | GET/POST | List/create reservations     |
| `/api/menu/categories/`         | GET    | List menu categories           |
| `/api/menu/items/`              | GET    | List menu items                |
| `/api/orders/`                  | GET/POST | List/create orders           |
| `/api/orders/kitchen/`          | GET    | Kitchen Display orders         |
| `/api/payments/`                | POST   | Process payment                |
