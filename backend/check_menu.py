import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_api.settings')
django.setup()

from apps.menu.models import MenuCategory, MenuItem

print("=" * 60)
print("MENU STATUS CHECK")
print("=" * 60)

# Check categories
categories = MenuCategory.objects.all()
print(f"\n✓ Total Categories: {categories.count()}")
for cat in categories:
    item_count = cat.items.count()
    print(f"  - {cat.name}: {item_count} items")

# Check items
items = MenuItem.objects.all()
print(f"\n✓ Total Menu Items: {items.count()}")

if items.count() == 0:
    print("\n⚠️  No menu items found! Seeding menu data...")
    from seeds.seed_data import create_menu
    create_menu()
    items = MenuItem.objects.all()
    print(f"\n✓ Menu items after seeding: {items.count()}")

# Show sample items
print("\nSample Menu Items:")
for item in MenuItem.objects.all()[:5]:
    print(f"  - {item.name} (Rs. {item.price}) [{item.category.name}]")

print("\n" + "=" * 60)
