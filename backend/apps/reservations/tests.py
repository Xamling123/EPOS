from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User
from apps.tables.models import Table
from apps.reservations.models import Reservation
from apps.reservations.serializers import ReservationCreateSerializer
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

class ReservationSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='password123',
            first_name='Test',
            last_name='User',
            role='customer'
        )
        self.table = Table.objects.create(
            table_number='T1',
            capacity=4,
            location='indoor'
        )
        self.factory = APIRequestFactory()

    def test_create_serializer_returns_id(self):
        future_date = (timezone.now() + timedelta(days=1)).date()
        data = {
            'table': self.table.id,
            'reservation_date': future_date,
            'start_time': '18:00',
            'end_time': '20:00',
            'guest_count': 2,
            'special_requests': 'None'
        }
        
        request = self.factory.post('/reservations/', data)
        request.user = self.user
        
        serializer = ReservationCreateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        reservation = serializer.save()
        
        # Check if 'id' is in the serialized data
        self.assertIn('id', serializer.data)
        self.assertEqual(serializer.data['id'], reservation.id)
