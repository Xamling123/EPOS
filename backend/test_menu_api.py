
import os
import django
import json
from rest_framework.test import APIRequestFactory
from apps.menu.views import MenuCategoryViewSet
from apps.menu.models import MenuCategory

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_api.settings')
django.setup()

factory = APIRequestFactory()
view = MenuCategoryViewSet.as_view({'get': 'with_items'})

request = factory.get('/api/menu/categories/with_items/')
response = view(request)

print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    data = response.data
    print(f"Success key: {data.get('success')}")
    categories = data.get('categories', [])
    print(f"Categories count: {len(categories)}")
    if len(categories) > 0:
        print(f"First category items count: {len(categories[0].get('items', []))}")
else:
    print(response.data)
