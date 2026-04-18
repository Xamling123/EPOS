import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_api.settings')
django.setup()

from apps.tables.models import Table
from apps.orders.models import Order, OrderItem
from apps.menu.models import MenuItem
from apps.users.models import User
from decimal import Decimal

print("=" * 70)
print("ORDER CREATION TEST")
print("=" * 70)

# Get a waiter and table
waiter = User.objects.filter(role='waiter').first()
table = Table.objects.first()
menu_items = MenuItem.objects.filter(is_available=True)[:2]

print(f"\n✓ Waiter: {waiter}")
print(f"✓ Table: {table}")
print(f"✓ Menu Items Available: {menu_items.count()}")

if not waiter or not table or not menu_items:
    print("\n❌ Missing required data for testing!")
    exit(1)

# Create an order
print("\n📝 Creating order...")
order = Order.objects.create(
    table=table,
    waiter=waiter,
    order_type='dine_in',
    status='pending',
    priority='normal'
)
print(f"✓ Order created: #{order.id} for Table {table.table_number}")

# Add items to order
print("\n📝 Adding items to order...")
for idx, menu_item in enumerate(menu_items, 1):
    order_item = OrderItem.objects.create(
        order=order,
        menu_item=menu_item,
        item_name=menu_item.name,
        unit_price=menu_item.price,
        quantity=1 + idx,
        total_price=menu_item.price * (1 + idx)
    )
    order.subtotal += order_item.total_price
    print(f"  {idx}. {menu_item.name} x{1+idx} @ Rs. {menu_item.price} = Rs. {order_item.total_price}")

# Calculate totals
from decimal import ROUND_HALF_UP
order.tax_amount = (order.subtotal * (order.tax_rate / 100)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
order.total_amount = (order.subtotal + order.tax_amount).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
order.save()

print(f"\n💰 Order Summary:")
print(f"   Subtotal: Rs. {order.subtotal}")
print(f"   Tax (13%): Rs. {order.tax_amount}")
print(f"   Total: Rs. {order.total_amount}")

print(f"\n✓ Order #{order.id} ready for kitchen!")
print(f"   Status: {order.status}")
print(f"   Items: {order.items.count()}")

print("\n" + "=" * 70)
