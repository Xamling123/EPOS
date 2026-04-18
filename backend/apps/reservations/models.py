"""
Reservation models with overlap validation.
Business Rule: A table cannot be reserved for overlapping time slots.
"""

from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings


class Reservation(models.Model):
    """
    Reservation model for table bookings.
    Enforces business rule: No double booking (overlapping time slots for same table).
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('seated', 'Seated'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reservations'
    )
    table = models.ForeignKey(
        'tables.Table',
        on_delete=models.CASCADE,
        related_name='reservations'
    )
    reservation_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    guest_count = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    special_requests = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reservations'
        ordering = ['-reservation_date', '-start_time']
        indexes = [
            models.Index(fields=['reservation_date', 'table']),
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self):
        return f"Reservation #{self.id} - Table {self.table.table_number} on {self.reservation_date}"
    
    def clean(self):
        """
        Validate that there are no overlapping reservations for the same table.
        Business Rule: A table cannot be reserved for overlapping time slots.
        """
        # Validate time order
        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                raise ValidationError({
                    'end_time': 'End time must be after start time.'
                })
        
        # Validate guest count against table capacity
        if self.table and self.guest_count:
            if self.guest_count > self.table.capacity:
                raise ValidationError({
                    'guest_count': f'Guest count ({self.guest_count}) exceeds table capacity ({self.table.capacity}).'
                })
        
        # Check for overlapping reservations
        if self.table and self.reservation_date and self.start_time and self.end_time:
            overlapping = Reservation.objects.filter(
                table=self.table,
                reservation_date=self.reservation_date,
                status__in=['pending', 'confirmed', 'seated'],
            ).exclude(
                pk=self.pk  # Exclude self when updating
            ).filter(
                # Overlap condition: (start1 < end2) AND (end1 > start2)
                start_time__lt=self.end_time,
                end_time__gt=self.start_time,
            )
            
            if overlapping.exists():
                conflicting = overlapping.first()
                raise ValidationError({
                    'table': f'Table {self.table.table_number} is already reserved from '
                             f'{conflicting.start_time} to {conflicting.end_time} on this date.'
                })
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def can_be_cancelled(self):
        """Check if reservation can be cancelled."""
        return self.status in ['pending', 'confirmed']
    
    def cancel(self):
        """Cancel the reservation."""
        if not self.can_be_cancelled():
            raise ValidationError('This reservation cannot be cancelled.')
        self.status = 'cancelled'
        self.save()
