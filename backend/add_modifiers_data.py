import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_api.settings')
django.setup()

from apps.menu.models import MenuItem, MenuCategory

def setup_modifiers():
    # Find or create a Main Course item to add modifiers to
    try:
        # Try to find a burger or steak
        item = MenuItem.objects.filter(name__icontains='Burger').first()
        if not item:
            item = MenuItem.objects.filter(category__name__icontains='Main').first()
        
        if item:
            print(f"Adding modifiers to {item.name}")
            item.available_modifiers = [
                {
                    "name": "Cooking Preference",
                    "options": ["Rare", "Medium Rare", "Medium", "Well Done"],
                    "required": True,
                    "multi_select": False
                },
                {
                    "name": "Add-ons",
                    "options": ["Cheese", "Bacon", "Extra Patty"],
                    "price_change": {"Cheese": 1.00, "Bacon": 2.00, "Extra Patty": 5.00},
                    "required": False,
                    "multi_select": True
                }
            ]
            item.save()
            print("Modifiers added successfully")
        else:
            print("No suitable item found to add modifiers to")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    setup_modifiers()
