import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_api.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from apps.orders.views import OrderViewSet
from apps.users.models import User
from apps.tables.models import Table
from apps.menu.models import MenuItem

print("=" * 70)
print("API ENDPOINT TEST: Order Creation")
print("=" * 70)

# Get test data
waiter = User.objects.filter(role='waiter').first() or User.objects.filter(role='admin').first()
table = Table.objects.first()
menu_items = MenuItem.objects.filter(is_available=True)[:2]

print(f"\n✓ Waiter: {waiter.email}")
print(f"✓ Table: {table}")
print(f"✓ Menu Items: {menu_items.count()}")

# Prepare request data
request_data = {
    'table': table.id,
    'items': [
        {
            'menu_item': menu_items[0].id,
            'quantity': 2,
            'notes': 'No spice'
        },
        {
            'menu_item': menu_items[1].id,
            'quantity': 1,
            'notes': ''
        }
    ],
    'order_type': 'dine_in',
    'priority': 'normal'
}

print(f"\n📋 Order Payload:")
print(json.dumps(request_data, indent=2, default=str))

# Create request
factory = APIRequestFactory()
request = factory.post('/api/orders/', data=request_data, format='json')
force_authenticate(request, user=waiter)

# Create view
view = OrderViewSet.as_view({'post': 'create'})
response = view(request)

print(f"\n📤 Response Status: {response.status_code}")

if response.status_code in [200, 201]:
    print("✅ Order created successfully!")
    data = response.data
    print(f"\n   Order ID: {data.get('id')}")
    print(f"   Status: {data.get('status')}")
    print(f"   Subtotal: Rs. {data.get('subtotal')}")
    print(f"   Tax: Rs. {data.get('tax_amount')}")
    print(f"   Total: Rs. {data.get('total_amount')}")
    print(f"   Items: {len(data.get('items', []))}")
    
    for idx, item in enumerate(data.get('items', []), 1):
        print(f"     {idx}. {item.get('item_name')} x{item.get('quantity')} @ Rs. {item.get('unit_price')}")
else:
    print(f"❌ Error: {response.status_code}")
    print(json.dumps(response.data, indent=2, default=str))

print("\n" + "=" * 70)
