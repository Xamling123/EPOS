"""
Tests for reservation overlap prevention.
Business Rule: A table cannot be reserved for overlapping time slots (no double booking).
"""

from django.test import TestCase
from django.core.exceptions import ValidationError
from datetime import date, time, timedelta
from apps.users.models import User
from apps.tables.models import Table
from apps.reservations.models import Reservation


class ReservationOverlapTestCase(TestCase):
    """Test cases for reservation overlap validation."""
    
    def setUp(self):
        """Set up test data."""
        # Create a test user
        self.customer = User.objects.create_user(
            email='customer@test.com',
            password='testpass123',
            first_name='Test',
            last_name='Customer',
            role='customer'
        )
        
        # Create a test table
        self.table = Table.objects.create(
            table_number='T1',
            capacity=4,
            status='available'
        )
        
        # Set test date (tomorrow)
        self.test_date = date.today() + timedelta(days=1)
    
    def test_create_first_reservation_succeeds(self):
        """Test that creating the first reservation for a table succeeds."""
        reservation = Reservation.objects.create(
            user=self.customer,
            table=self.table,
            reservation_date=self.test_date,
            start_time=time(18, 0),  # 6:00 PM
            end_time=time(20, 0),    # 8:00 PM
            guest_count=2,
            status='confirmed'
        )
        
        self.assertEqual(reservation.status, 'confirmed')
        self.assertEqual(reservation.table, self.table)
    
    def test_overlapping_reservation_fails(self):
        """Test that creating an overlapping reservation raises ValidationError."""
        # Create first reservation: 6:00 PM - 8:00 PM
        Reservation.objects.create(
            user=self.customer,
            table=self.table,
            reservation_date=self.test_date,
            start_time=time(18, 0),
            end_time=time(20, 0),
            guest_count=2,
            status='confirmed'
        )
        
        # Try to create overlapping reservation: 7:00 PM - 9:00 PM
        with self.assertRaises(ValidationError) as context:
            Reservation.objects.create(
                user=self.customer,
                table=self.table,
                reservation_date=self.test_date,
                start_time=time(19, 0),  # 7:00 PM - overlaps with first
                end_time=time(21, 0),    # 9:00 PM
                guest_count=2,
                status='confirmed'
            )
        
        self.assertIn('table', str(context.exception))
    
    def test_completely_overlapping_reservation_fails(self):
        """Test that a reservation entirely within another time slot fails."""
        # Create first reservation: 5:00 PM - 9:00 PM
        Reservation.objects.create(
            user=self.customer,
            table=self.table,
            reservation_date=self.test_date,
            start_time=time(17, 0),
            end_time=time(21, 0),
            guest_count=2,
            status='confirmed'
        )
        
        # Try to create reservation inside: 6:00 PM - 8:00 PM
        with self.assertRaises(ValidationError):
            Reservation.objects.create(
                user=self.customer,
                table=self.table,
                reservation_date=self.test_date,
                start_time=time(18, 0),
                end_time=time(20, 0),
                guest_count=2,
                status='pending'
            )
    
    def test_adjacent_reservations_succeed(self):
        """Test that back-to-back reservations (no overlap) succeed."""
        # Create first reservation: 6:00 PM - 8:00 PM
        res1 = Reservation.objects.create(
            user=self.customer,
            table=self.table,
            reservation_date=self.test_date,
            start_time=time(18, 0),
            end_time=time(20, 0),
            guest_count=2,
            status='confirmed'
        )
        
        # Create adjacent reservation: 8:00 PM - 10:00 PM (starts when first ends)
        res2 = Reservation.objects.create(
            user=self.customer,
            table=self.table,
            reservation_date=self.test_date,
            start_time=time(20, 0),  # Starts exactly when first ends
            end_time=time(22, 0),
            guest_count=2,
            status='confirmed'
        )
        
        self.assertEqual(res1.end_time, res2.start_time)
        self.assertEqual(Reservation.objects.count(), 2)
    
    def test_different_table_same_time_succeeds(self):
        """Test that same time slot on different tables succeeds."""
        # Create second table
        table2 = Table.objects.create(
            table_number='T2',
            capacity=6,
            status='available'
        )
        
        # Create reservation on table 1
        Reservation.objects.create(
            user=self.customer,
            table=self.table,
            reservation_date=self.test_date,
            start_time=time(18, 0),
            end_time=time(20, 0),
            guest_count=2,
            status='confirmed'
        )
        
        # Create reservation on table 2 at same time
        res2 = Reservation.objects.create(
            user=self.customer,
            table=table2,
            reservation_date=self.test_date,
            start_time=time(18, 0),
            end_time=time(20, 0),
            guest_count=4,
            status='confirmed'
        )
        
        self.assertEqual(res2.table, table2)
    
    def test_different_date_same_time_succeeds(self):
        """Test that same time slot on different dates succeeds."""
        tomorrow = self.test_date
        day_after = self.test_date + timedelta(days=1)
        
        # Create reservation for tomorrow
        Reservation.objects.create(
            user=self.customer,
            table=self.table,
            reservation_date=tomorrow,
            start_time=time(18, 0),
            end_time=time(20, 0),
            guest_count=2,
            status='confirmed'
        )
        
        # Create reservation for day after tomorrow at same time
        res2 = Reservation.objects.create(
            user=self.customer,
            table=self.table,
            reservation_date=day_after,
            start_time=time(18, 0),
            end_time=time(20, 0),
            guest_count=2,
            status='confirmed'
        )
        
        self.assertEqual(res2.reservation_date, day_after)
    
    def test_cancelled_reservation_allows_overlap(self):
        """Test that cancelled reservations don't block new reservations."""
        # Create and cancel a reservation
        cancelled_res = Reservation.objects.create(
            user=self.customer,
            table=self.table,
            reservation_date=self.test_date,
            start_time=time(18, 0),
            end_time=time(20, 0),
            guest_count=2,
            status='confirmed'
        )
        cancelled_res.status = 'cancelled'
        cancelled_res.save()
        
        # Create new reservation at same time - should succeed
        new_res = Reservation.objects.create(
            user=self.customer,
            table=self.table,
            reservation_date=self.test_date,
            start_time=time(18, 0),
            end_time=time(20, 0),
            guest_count=3,
            status='confirmed'
        )
        
        self.assertEqual(new_res.status, 'confirmed')
    
    def test_guest_count_exceeds_capacity_fails(self):
        """Test that guest count cannot exceed table capacity."""
        with self.assertRaises(ValidationError) as context:
            Reservation.objects.create(
                user=self.customer,
                table=self.table,  # capacity = 4
                reservation_date=self.test_date,
                start_time=time(18, 0),
                end_time=time(20, 0),
                guest_count=10,  # Exceeds capacity
                status='pending'
            )
        
        self.assertIn('guest_count', str(context.exception))
    
    def test_end_time_before_start_time_fails(self):
        """Test that end time must be after start time."""
        with self.assertRaises(ValidationError) as context:
            Reservation.objects.create(
                user=self.customer,
                table=self.table,
                reservation_date=self.test_date,
                start_time=time(20, 0),
                end_time=time(18, 0),  # Before start time
                guest_count=2,
                status='pending'
            )
        
        self.assertIn('end_time', str(context.exception))
