# EPOS System - Development Environment Setup

## Project Overview
Smart Restaurant Reservation & Pre-Order System with EPOS Integration

## Tech Stack
- **Backend**: Django 5.1.4, Django REST Framework
- **Frontend**: React 18 with Vite
- **Database**: SQLite (dev) / MySQL (production)
- **Real-time**: Django Channels
- **Styling**: Tailwind CSS

## System Components

### Backend Apps
- **Users**: Authentication, role-based access control
- **Tables**: Restaurant table management
- **Reservations**: Table reservation system
- **Menu**: Menu categories and items
- **Orders**: Order management, Kitchen Display System
- **Payments**: Payment processing (eSewa integration)
- **Inventory**: Stock management

### Frontend Pages
- **Admin Dashboard**: Analytics, menu management, user management
- **Waiter Panel**: Order creation, order tracking, table management
- **Chef KDS**: Kitchen display system, order preparation
- **Cashier**: Billing, payment processing
- **Customer Portal**: Reservations, menu browsing, pre-orders

## Development Workflow

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Testing

### Backend Tests
```bash
cd backend
python manage.py test tests/ -v 2
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## API Documentation
See `API_DOCUMENTATION.md` for detailed endpoint documentation

## Database Models

### User
- Email (unique)
- Role (admin, waiter, chef, cashier, customer)
- Phone
- Timestamps

### Table
- Table number (unique)
- Capacity
- Status (available, occupied, reserved, maintenance)
- Location

### Reservation
- Customer, Table, Date, Time
- Guest count
- Status (pending, confirmed, checked_in, completed, cancelled)

### MenuItem
- Category, Name, Description
- Price
- Availability status
- Prep time

### Order
- Table, Customer, Waiter
- Items with quantity and price snapshot
- Status tracking
- Total amount, payment status

## Deployment
See `deploy.sh` for automated deployment script

## Common Issues

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000
# Kill process
kill -9 <PID>
```

### Database Errors
```bash
# Reset database (development only)
rm db.sqlite3
python manage.py migrate
```

### Node Modules Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

## Contributing
1. Create feature branch
2. Make changes
3. Test locally
4. Commit with meaningful message
5. Push and create PR

## Support
For issues or questions, refer to documentation or create an issue in the repository.
