
import os
import sys
import django

# Add project root to sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_api.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from apps.reservations.views import ReservationViewSet
from apps.users.models import User
from apps.reservations.models import Reservation

# Get a customer user
customer = User.objects.filter(role='customer').first()
if not customer:
    print("No customer found!")
else:
    print(f"Testing with customer: {customer.email}")
    
    factory = APIRequestFactory()
    view = ReservationViewSet.as_view({'get': 'my_reservations'})
    
    request = factory.get('/api/reservations/my_reservations/')
    force_authenticate(request, user=customer)
    response = view(request)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        import json
        print(json.dumps(response.data, indent=2, default=str))
    else:
        print(response.data)
