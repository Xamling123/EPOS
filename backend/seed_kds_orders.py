import os
import django
import random
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_api.settings')
django.setup()

from apps.orders.models import Order, OrderItem
from apps.menu.models import MenuItem
from apps.tables.models import Table
from apps.users.models import User

def create_kds_orders():
    print("Creating KDS Test Orders...")
    
    # Get or create necessary data
    table = Table.objects.first()
    if not table:
        print("No tables found. Please run seed_tables.py first.")
        return

    waiter = User.objects.filter(role='waiter').first()
    if not waiter:
        # Create a dummy waiter if none exists
        waiter = User.objects.create_user(
            email='kds_waiter@test.com', 
            password='test', 
            role='waiter',
            first_name='KDS',
            last_name='Tester'
        )

    menu_items = list(MenuItem.objects.all())
    if not menu_items:
        print("No menu items found. Please create some menu items first.")
        return

    # Create Orders with different priorities
    priorities = ['high', 'normal', 'low']
    
    for i, priority in enumerate(priorities):
        order = Order.objects.create(
            table=table,
            waiter=waiter,
            order_type='dine_in',
            status='confirmed', # Confirmed orders show on KDS
            priority=priority,
            notes=f"Test {priority.upper()} Priority Order"
        )
        
        # Add random items
        num_items = random.randint(1, 3)
        selected_items = random.sample(menu_items, min(num_items, len(menu_items)))
        
        for item in selected_items:
            OrderItem.objects.create(
                order=order,
                menu_item=item,
                item_name=item.name,
                unit_price=item.price,
                quantity=random.randint(1, 2),
                total_price=item.price * Decimal('1.00'), # simplified
                status='pending'
            )
        
        order.calculate_totals()
        print(f"Created {priority} priority order #{order.id}")

    print("Done! Check KDS at http://localhost:5173/kitchen")

if __name__ == '__main__':
    create_kds_orders()
