"""
Seed data script for development and testing.
Run with: python manage.py shell < seeds/seed_data.py
Or import and call seed_all() from Django shell.
"""

import os
import django

# Setup Django settings if running as script
if not os.environ.get('DJANGO_SETTINGS_MODULE'):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_api.settings')
    django.setup()

from decimal import Decimal
from datetime import date, time, timedelta
from django.utils import timezone
from apps.users.models import User
from apps.tables.models import Table
from apps.menu.models import MenuCategory, MenuItem
from apps.reservations.models import Reservation
from apps.orders.models import Order, OrderItem


def create_users():
    """Create sample users with different roles."""
    print("Creating users...")
    
    users = [
        {
            'email': 'admin@restaurant.com',
            'password': 'admin123',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True
        },
        {
            'email': 'waiter@restaurant.com',
            'password': 'waiter123',
            'first_name': 'John',
            'last_name': 'Waiter',
            'role': 'waiter'
        },
        {
            'email': 'chef@restaurant.com',
            'password': 'chef123',
            'first_name': 'Maria',
            'last_name': 'Chef',
            'role': 'chef'
        },
        {
            'email': 'cashier@restaurant.com',
            'password': 'cashier123',
            'first_name': 'Sarah',
            'last_name': 'Cashier',
            'role': 'cashier'
        },
        {
            'email': 'customer@example.com',
            'password': 'customer123',
            'first_name': 'Ram',
            'last_name': 'Sharma',
            'role': 'customer',
            'phone': '+977-9841234567'
        },
        {
            'email': 'customer2@example.com',
            'password': 'customer123',
            'first_name': 'Sita',
            'last_name': 'Thapa',
            'role': 'customer',
            'phone': '+977-9851234567'
        },
    ]
    
    created_users = {}
    for user_data in users:
        email = user_data.pop('email')
        password = user_data.pop('password')
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults=user_data
        )
        if created:
            user.set_password(password)
            user.save()
            print(f"  Created: {email}")
        else:
            print(f"  Exists: {email}")
        
        created_users[user.role] = user
    
    return created_users


def create_tables():
    """Create restaurant tables."""
    print("Creating tables...")
    
    tables_data = [
        {'table_number': 'T1', 'capacity': 2, 'location': 'Window'},
        {'table_number': 'T2', 'capacity': 2, 'location': 'Window'},
        {'table_number': 'T3', 'capacity': 4, 'location': 'Main Hall'},
        {'table_number': 'T4', 'capacity': 4, 'location': 'Main Hall'},
        {'table_number': 'T5', 'capacity': 6, 'location': 'Main Hall'},
        {'table_number': 'T6', 'capacity': 6, 'location': 'Main Hall'},
        {'table_number': 'T7', 'capacity': 8, 'location': 'Private Room'},
        {'table_number': 'T8', 'capacity': 10, 'location': 'Private Room'},
        {'table_number': 'P1', 'capacity': 4, 'location': 'Patio'},
        {'table_number': 'P2', 'capacity': 4, 'location': 'Patio'},
    ]
    
    tables = []
    for table_data in tables_data:
        table, created = Table.objects.get_or_create(
            table_number=table_data['table_number'],
            defaults=table_data
        )
        tables.append(table)
        if created:
            print(f"  Created: Table {table.table_number}")
    
    return tables


def create_menu():
    """Create menu categories and items."""
    print("Creating menu...")
    
    menu_data = {
        'Appetizers': [
            {'name': 'Momo (Steamed)', 'price': '180.00', 'description': 'Traditional Nepali steamed dumplings', 'preparation_time_mins': 20},
            {'name': 'Momo (Fried)', 'price': '200.00', 'description': 'Crispy fried Nepali dumplings', 'preparation_time_mins': 25},
            {'name': 'Spring Rolls', 'price': '150.00', 'description': 'Crispy vegetable spring rolls', 'is_vegetarian': True, 'preparation_time_mins': 15},
            {'name': 'Chicken Wings', 'price': '280.00', 'description': 'Spicy chicken wings with blue cheese dip', 'spice_level': 2},
            {'name': 'Soup of the Day', 'price': '120.00', 'description': 'Ask your server for today\'s selection', 'is_vegetarian': True},
        ],
        'Main Course': [
            {'name': 'Chicken Curry', 'price': '450.00', 'description': 'Traditional Nepali chicken curry with spices', 'spice_level': 2},
            {'name': 'Dal Bhat Set', 'price': '350.00', 'description': 'Complete Nepali meal with rice, lentils, vegetables', 'is_vegetarian': True},
            {'name': 'Butter Chicken', 'price': '480.00', 'description': 'Creamy tomato-based chicken curry', 'spice_level': 1},
            {'name': 'Grilled Fish', 'price': '520.00', 'description': 'Fresh fish grilled with herbs and lemon'},
            {'name': 'Mutton Biryani', 'price': '550.00', 'description': 'Aromatic rice with tender mutton'},
            {'name': 'Paneer Tikka Masala', 'price': '380.00', 'description': 'Cottage cheese in spiced tomato gravy', 'is_vegetarian': True},
            {'name': 'Pasta Alfredo', 'price': '360.00', 'description': 'Creamy white sauce pasta', 'is_vegetarian': True},
            {'name': 'Chicken Chowmein', 'price': '280.00', 'description': 'Stir-fried noodles with chicken and vegetables'},
        ],
        'Pizza': [
            {'name': 'Margherita', 'price': '420.00', 'description': 'Classic tomato and mozzarella', 'is_vegetarian': True, 'preparation_time_mins': 20},
            {'name': 'Pepperoni', 'price': '480.00', 'description': 'Loaded with spicy pepperoni', 'preparation_time_mins': 20},
            {'name': 'BBQ Chicken', 'price': '520.00', 'description': 'BBQ sauce, chicken, onions, cilantro', 'preparation_time_mins': 25},
            {'name': 'Veggie Supreme', 'price': '450.00', 'description': 'Bell peppers, mushrooms, olives, onions', 'is_vegetarian': True, 'is_vegan': True},
        ],
        'Beverages': [
            {'name': 'Masala Tea', 'price': '60.00', 'description': 'Traditional spiced tea', 'is_vegetarian': True, 'is_vegan': True, 'preparation_time_mins': 5},
            {'name': 'Coffee', 'price': '80.00', 'description': 'Fresh brewed coffee', 'is_vegetarian': True, 'is_vegan': True, 'preparation_time_mins': 5},
            {'name': 'Fresh Lime Soda', 'price': '70.00', 'description': 'Refreshing lime soda', 'is_vegetarian': True, 'is_vegan': True, 'preparation_time_mins': 3},
            {'name': 'Mango Lassi', 'price': '120.00', 'description': 'Sweet mango yogurt drink', 'is_vegetarian': True},
            {'name': 'Soft Drinks', 'price': '60.00', 'description': 'Coke, Sprite, Fanta', 'is_vegetarian': True, 'is_vegan': True, 'preparation_time_mins': 1},
        ],
        'Desserts': [
            {'name': 'Gulab Jamun', 'price': '120.00', 'description': 'Sweet milk dumplings in syrup', 'is_vegetarian': True},
            {'name': 'Ice Cream', 'price': '100.00', 'description': 'Vanilla, Chocolate, or Strawberry', 'is_vegetarian': True},
            {'name': 'Kheer', 'price': '130.00', 'description': 'Traditional rice pudding', 'is_vegetarian': True},
            {'name': 'Chocolate Brownie', 'price': '180.00', 'description': 'Warm brownie with ice cream', 'is_vegetarian': True},
        ],
    }
    
    categories = []
    items = []
    display_order = 1
    
    for category_name, menu_items in menu_data.items():
        category, created = MenuCategory.objects.get_or_create(
            name=category_name,
            defaults={'display_order': display_order}
        )
        categories.append(category)
        display_order += 1
        
        if created:
            print(f"  Created category: {category_name}")
        
        for item_data in menu_items:
            item_data['price'] = Decimal(item_data['price'])
            item_data['category'] = category
            
            item, created = MenuItem.objects.get_or_create(
                name=item_data['name'],
                category=category,
                defaults=item_data
            )
            items.append(item)
            
            if created:
                print(f"    Created item: {item.name}")
    
    return categories, items


def create_sample_reservations(users, tables):
    """Create sample reservations."""
    print("Creating sample reservations...")
    
    customer = users.get('customer')
    if not customer:
        print("  No customer found, skipping reservations")
        return []
    
    tomorrow = date.today() + timedelta(days=1)
    day_after = date.today() + timedelta(days=2)
    
    reservations_data = [
        {
            'user': customer,
            'table': tables[0],  # T1
            'reservation_date': tomorrow,
            'start_time': time(18, 0),
            'end_time': time(20, 0),
            'guest_count': 2,
            'status': 'confirmed',
            'special_requests': 'Anniversary dinner, please arrange a small cake'
        },
        {
            'user': customer,
            'table': tables[4],  # T5
            'reservation_date': day_after,
            'start_time': time(19, 0),
            'end_time': time(21, 30),
            'guest_count': 5,
            'status': 'pending',
            'special_requests': 'Birthday celebration'
        },
    ]
    
    reservations = []
    for res_data in reservations_data:
        try:
            res = Reservation.objects.create(**res_data)
            reservations.append(res)
            print(f"  Created: Reservation for {res.reservation_date} at {res.start_time}")
        except Exception as e:
            print(f"  Error creating reservation: {e}")
    
    return reservations


def create_sample_orders(users, tables, items):
    """Create sample orders for testing."""
    print("Creating sample orders...")
    
    waiter = users.get('waiter')
    if not waiter or not items:
        print("  Missing waiter or menu items, skipping orders")
        return []
    
    # Create an active order
    order = Order.objects.create(
        table=tables[2],  # T3
        waiter=waiter,
        order_type='dine_in',
        status='confirmed'
    )
    
    # Add some items
    for item in items[:3]:  # First 3 items
        OrderItem.objects.create(
            order=order,
            menu_item=item,
            quantity=1
        )
    
    order.calculate_totals()
    print(f"  Created: Order #{order.id} for Table {order.table.table_number}")
    
    return [order]


def seed_all():
    """Run all seed functions."""
    print("\n" + "="*50)
    print("SEEDING DATABASE")
    print("="*50 + "\n")
    
    users = create_users()
    tables = create_tables()
    categories, items = create_menu()
    reservations = create_sample_reservations(users, tables)
    orders = create_sample_orders(users, tables, items)
    
    print("\n" + "="*50)
    print("SEEDING COMPLETE!")
    print("="*50)
    print(f"""
Summary:
- Users: {User.objects.count()}
- Tables: {Table.objects.count()}
- Menu Categories: {MenuCategory.objects.count()}
- Menu Items: {MenuItem.objects.count()}
- Reservations: {Reservation.objects.count()}
- Orders: {Order.objects.count()}

Login credentials:
- Admin: admin@restaurant.com / admin123
- Waiter: waiter@restaurant.com / waiter123
- Chef: chef@restaurant.com / chef123
- Cashier: cashier@restaurant.com / cashier123
- Customer: customer@example.com / customer123
""")


if __name__ == '__main__':
    seed_all()
