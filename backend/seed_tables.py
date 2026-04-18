
import os
import django
from pathlib import Path

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_api.settings')
django.setup()

from apps.tables.models import Table

def seed_tables():
    print("🚀 Seeding Tables...")
    
    tables_data = [
        # Window Seats
        {'table_number': 'W1', 'capacity': 2, 'location': 'Window', 'status': 'available'},
        {'table_number': 'W2', 'capacity': 2, 'location': 'Window', 'status': 'available'},
        {'table_number': 'W3', 'capacity': 4, 'location': 'Window', 'status': 'available'},
        {'table_number': 'W4', 'capacity': 4, 'location': 'Window', 'status': 'available'},
        
        # Main Hall
        {'table_number': 'M1', 'capacity': 2, 'location': 'Main Hall', 'status': 'available'},
        {'table_number': 'M2', 'capacity': 4, 'location': 'Main Hall', 'status': 'available'},
        {'table_number': 'M3', 'capacity': 4, 'location': 'Main Hall', 'status': 'available'},
        {'table_number': 'M4', 'capacity': 6, 'location': 'Main Hall', 'status': 'available'},
        {'table_number': 'M5', 'capacity': 6, 'location': 'Main Hall', 'status': 'available'},
        {'table_number': 'M6', 'capacity': 8, 'location': 'Main Hall', 'status': 'available'},
        
        # Patio
        {'table_number': 'P1', 'capacity': 2, 'location': 'Patio', 'status': 'available'},
        {'table_number': 'P2', 'capacity': 4, 'location': 'Patio', 'status': 'available'},
        {'table_number': 'P3', 'capacity': 4, 'location': 'Patio', 'status': 'available'},
    ]
    
    count = 0
    for data in tables_data:
        table, created = Table.objects.get_or_create(
            table_number=data['table_number'],
            defaults=data
        )
        if created:
            count += 1
            print(f"  + Created {table}")
            
    print(f"\n✨ Successfully seeded {count} tables!")
    print(f"Total tables: {Table.objects.count()}")

if __name__ == '__main__':
    seed_tables()
