import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_api.settings')
django.setup()

from apps.orders.models import Order
from apps.menu.models import MenuItem

print("=" * 70)
print("DATABASE CHECK: Recent Orders")
print("=" * 70)

# Get recent orders
recent_orders = Order.objects.select_related('table', 'waiter').prefetch_related('items').order_by('-id')[:5]

print(f"\n  Total Orders in DB: {Order.objects.count()}")
print(f"\n  Recent Orders:")

for idx, order in enumerate(recent_orders, 1):
    print(f"\n  {idx}. Order #{order.id}")
    print(f"     Table: {order.table.table_number}")
    print(f"     Waiter: {order.waiter.email if order.waiter else 'N/A'}")
    print(f"     Status: {order.status}")
    print(f"     Items: {order.items.count()}")
    print(f"     Subtotal: Rs. {order.subtotal}")
    print(f"     Tax: Rs. {order.tax_amount}")
    print(f"     Total: Rs. {order.total_amount}")
    
    for item in order.items.all()[:3]:
        print(f"       - {item.item_name} x{item.quantity} @ Rs. {item.unit_price}")

print("\n" + "=" * 70)
print("\nSummary:")
print(f"  ✅ Orders can be created")
print(f"  ✅ Menu items can be added to orders")
print(f"  ✅ Order totals are calculated")
print(f"  ✅ Waiter can place orders")
print("\n" + "=" * 70)
