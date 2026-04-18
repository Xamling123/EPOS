import os
import django
from pathlib import Path

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_api.settings')
django.setup()

from apps.users.models import User

# Create demo accounts
demo_accounts = [
    {'email': 'admin@restaurant.com', 'password': 'admin123', 'first_name': 'Admin', 'last_name': 'User', 'role': 'admin'},
    {'email': 'waiter@restaurant.com', 'password': 'waiter123', 'first_name': 'John', 'last_name': 'Waiter', 'role': 'waiter'},
    {'email': 'chef@restaurant.com', 'password': 'chef123', 'first_name': 'Chef', 'last_name': 'Gordon', 'role': 'chef'},
    {'email': 'cashier@restaurant.com', 'password': 'cashier123', 'first_name': 'Cashier', 'last_name': 'Sara', 'role': 'cashier'},
    {'email': 'customer@example.com', 'password': 'customer123', 'first_name': 'John', 'last_name': 'Customer', 'role': 'customer'},
]

for account in demo_accounts:
    if not User.objects.filter(email=account['email']).exists():
        User.objects.create_user(
            email=account['email'],
            password=account['password'],
            first_name=account['first_name'],
            last_name=account['last_name'],
            role=account['role']
        )
        print(f"✓ Created {account['email']}")
    else:
        print(f"✗ {account['email']} already exists")

print("\nDemo accounts setup complete!")
