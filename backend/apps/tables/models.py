"""
Restaurant table models.
"""

from django.db import models


class Table(models.Model):
    """
    Represents a physical table in the restaurant.
    """
    
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('reserved', 'Reserved'),
        ('maintenance', 'Maintenance'),
    ]
    
    table_number = models.CharField(max_length=20, unique=True)
    capacity = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    location = models.CharField(max_length=100, blank=True, help_text="e.g., Patio, Window, Main Hall")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tables'
        ordering = ['table_number']
    
    def __str__(self):
        return f"Table {self.table_number} (Capacity: {self.capacity})"
    
    def is_available_for_reservation(self):
        """Check if table is in a state that allows reservations."""
        return self.is_active and self.status not in ['maintenance']
