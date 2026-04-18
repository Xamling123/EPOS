import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_api.settings')
django.setup()

from seeds.seed_data import create_menu

print("🍽️  Seeding Complete Menu...")
categories, items = create_menu()

print(f"\n✓ Successfully seeded menu!")
print(f"   Categories: {len(categories)}")
print(f"   Items: {len(items)}")
