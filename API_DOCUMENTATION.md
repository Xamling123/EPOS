# EPOS API Documentation

## Authentication Endpoints

### POST /api/auth/register/
Register new customer account
```json
{
  "email": "user@example.com",
  "password": "securepass123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+977-9841234567"
}
```

### POST /api/auth/login/
Login and get JWT tokens
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

Response:
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "customer",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

## Order Endpoints

### GET /api/orders/
List all orders (paginated)

### POST /api/orders/
Create new order
```json
{
  "table_id": 1,
  "order_type": "dine_in",
  "items": [
    {
      "menu_item_id": 5,
      "quantity": 2,
      "special_instructions": "No onions"
    }
  ]
}
```

### GET /api/orders/{id}/
Get order details

### PATCH /api/orders/{id}/
Update order status
```json
{
  "status": "confirmed"
}
```

### POST /api/orders/{id}/add_item/
Add item to existing order
```json
{
  "menu_item_id": 3,
  "quantity": 1
}
```

## Table Endpoints

### GET /api/tables/
List all tables

### POST /api/tables/availability/
Check available tables
```json
{
  "date": "2026-04-25",
  "start_time": "18:00",
  "end_time": "20:00",
  "guest_count": 4
}
```

## Menu Endpoints

### GET /api/menu/categories/
List menu categories

### GET /api/menu/items/
List menu items

### GET /api/menu/categories/with_items/
Get categories with items

## Reservation Endpoints

### GET /api/reservations/
List reservations

### POST /api/reservations/
Create reservation
```json
{
  "table_id": 2,
  "reservation_date": "2026-04-25",
  "start_time": "18:00",
  "end_time": "20:00",
  "guest_count": 4,
  "special_requests": "Birthday celebration"
}
```

## Payment Endpoints

### POST /api/payments/process/
Process payment
```json
{
  "order_id": 5,
  "amount": 2500.00,
  "payment_method": "cash"
}
```
