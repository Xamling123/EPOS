
import os
import django
from pathlib import Path

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_api.settings')
django.setup()

from django.core.management import call_command
from apps.users.models import User
from apps.menu.models import MenuCategory, MenuItem

def setup():
    print("🚀 Starting Project Setup...")
    
    # 1. Migrations are handled manually
    # Please ensure you have run:
    # python manage.py makemigrations users menu tables reservations orders payments
    # python manage.py migrate

    
    # 2. Create Superuser
    print("\n👤 Creating admin user...")
    if not User.objects.filter(email='admin@example.com').exists():
        User.objects.create_superuser(
            email='admin@example.com',
            password='admin123',
            first_name='Admin',
            last_name='User',
            phone='9800000000'
        )
        print("✅ Superuser created: admin@example.com / admin123")
    else:
        print("ℹ️ Superuser already exists")
        
    # 3. Seed Menu Data
    print("\n🍽️ Seeding menu data...")
    
    # Categories
    categories_data = [
        {'name': 'Appetizers', 'display_order': 1, 'description': 'Starters to whet your appetite'},
        {'name': 'Main Course', 'display_order': 2, 'description': 'Hearty meals for the main event'},
        {'name': 'Drinks', 'display_order': 3, 'description': 'Refreshing beverages'},
        {'name': 'Desserts', 'display_order': 4, 'description': 'Sweet treats to finish'},
    ]
    
    categories = {}
    for cat_data in categories_data:
        cat, created = MenuCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults=cat_data
        )
        categories[cat.name] = cat
        if created:
            print(f"  + Category created: {cat.name}")
            
    # Menu Items
    items_data = [
        {
            'category': 'Appetizers',
            'name': 'Steam Momo',
            'description': 'Steamed dumplings filled with spiced minced meat.',
            'price': 150.0,
            'is_available': True,
            'spice_level': 2,
            'preparation_time_mins': 15
        },
        {
            'category': 'Appetizers',
            'name': 'Chicken Wings',
            'description': 'Crispy fried chicken wings with hot sauce.',
            'price': 250.0,
            'is_available': True,
            'spice_level': 3,
            'preparation_time_mins': 20
        },
        {
            'category': 'Main Course',
            'name': 'Chicken Thukpa',
            'description': 'Hot noodle soup with chicken and vegetables.',
            'price': 200.0,
            'is_available': True,
            'spice_level': 2,
            'preparation_time_mins': 15
        },
        {
            'category': 'Main Course',
            'name': 'Veg Chowmein',
            'description': 'Stir-fried noodles with mixed vegetables.',
            'price': 180.0,
            'is_vegetarian': True,
            'is_available': True,
            'spice_level': 1,
            'preparation_time_mins': 12
        },
        {
            'category': 'Drinks',
            'name': 'Mango Lassi',
            'description': 'Sweet yoghurt drink with mango pulp.',
            'price': 120.0,
            'is_vegetarian': True,
            'is_available': True,
            'preparation_time_mins': 5
        }
    ]
    
    for item_data in items_data:
        cat_name = item_data.pop('category')
        category = categories.get(cat_name)
        
        if category:
            item, created = MenuItem.objects.get_or_create(
                name=item_data['name'],
                category=category,
                defaults=item_data
            )
            if created:
                print(f"  + Item created: {item.name}")

    print("\n✨ Setup completed successfully! You can now run the server.")

if __name__ == '__main__':
    setup()
