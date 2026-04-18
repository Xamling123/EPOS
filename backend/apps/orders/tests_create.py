from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User
from apps.tables.models import Table
from apps.reservations.models import Reservation
from apps.orders.serializers import OrderCreateSerializer
from rest_framework.test import APIRequestFactory

class OrderCreateSerializerTest(TestCase):
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
        self.reservation = Reservation.objects.create(
            user=self.user,
            table=self.table,
            reservation_date=timezone.now().date(),
            start_time='18:00',
            end_time='20:00',
            guest_count=2,
            status='confirmed'
        )
        self.factory = APIRequestFactory()

    def test_create_order_from_reservation_without_table(self):
        data = {
            'reservation': self.reservation.id,
            'order_type': 'pre_order',
            'items': []
        }
        
        request = self.factory.post('/orders/', data)
        request.user = self.user
        
        serializer = OrderCreateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        order = serializer.save()
        
        # Check if table was correctly assigned from reservation
        self.assertEqual(order.table, self.table)
        self.assertEqual(order.reservation, self.reservation)
        self.assertEqual(order.order_type, 'pre_order')
