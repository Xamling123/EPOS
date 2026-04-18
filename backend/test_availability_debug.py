#!/usr/bin/env python
"""Debug availability endpoint issues"""

import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_api.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from apps.tables.views import TableViewSet

# Create a test request
factory = APIRequestFactory()
view = TableViewSet.as_view({'post': 'availability'})

print("=" * 80)
print("TEST 1: Valid request with integer guest_count")
print("=" * 80)
request = factory.post('/api/tables/availability/', {
    'date': '2026-04-20',
    'start_time': '18:00',
    'end_time': '20:00',
    'guest_count': 2
}, format='json')

response = view(request)
print(f"Status: {response.status_code}")
print(f"Data: {json.dumps(response.data, indent=2, default=str)}")

print("\n" + "=" * 80)
print("TEST 2: Valid request with string guest_count")
print("=" * 80)
request2 = factory.post('/api/tables/availability/', {
    'date': '2026-04-20',
    'start_time': '18:00',
    'end_time': '20:00',
    'guest_count': '2'
}, format='json')

response2 = view(request2)
print(f"Status: {response2.status_code}")
print(f"Data: {json.dumps(response2.data, indent=2, default=str)}")

print("\n" + "=" * 80)
print("TEST 3: Missing guest_count")
print("=" * 80)
request3 = factory.post('/api/tables/availability/', {
    'date': '2026-04-20',
    'start_time': '18:00',
    'end_time': '20:00'
}, format='json')

response3 = view(request3)
print(f"Status: {response3.status_code}")
print(f"Data: {json.dumps(response3.data, indent=2, default=str)}")

print("\n" + "=" * 80)
print("TEST 4: Invalid time format")
print("=" * 80)
request4 = factory.post('/api/tables/availability/', {
    'date': '2026-04-20',
    'start_time': '6:00 PM',
    'end_time': '8:00 PM',
    'guest_count': 2
}, format='json')

response4 = view(request4)
print(f"Status: {response4.status_code}")
print(f"Data: {json.dumps(response4.data, indent=2, default=str)}")

print("\n" + "=" * 80)
print("TEST 5: Missing required field (date)")
print("=" * 80)
request5 = factory.post('/api/tables/availability/', {
    'start_time': '18:00',
    'end_time': '20:00',
    'guest_count': 2
}, format='json')

response5 = view(request5)
print(f"Status: {response5.status_code}")
print(f"Data: {json.dumps(response5.data, indent=2, default=str)}")
