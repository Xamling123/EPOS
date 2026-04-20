"""
Payment models for processing order payments.
"""

from django.db import models
from django.conf import settings
import uuid


class Payment(models.Model):
    """
    Payment record for orders.
    Supports multiple payment methods including mock gateway.
    """
    
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('khalti', 'Khalti'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=100, unique=True, blank=True)
    gateway_response = models.JSONField(null=True, blank=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='processed_payments'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment #{self.id} - Rs.{self.amount} ({self.status})"
    
    def save(self, *args, **kwargs):
        if not self.transaction_id:
            self.transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)
    
    def complete(self):
        """Mark payment as completed and update order."""
        self.status = 'completed'
        self.save()
        
        # Update order
        order = self.order
        order.is_paid = True
        order.status = 'closed'
        order.cashier = self.processed_by
        from django.utils import timezone
        order.closed_at = timezone.now()
        order.save(update_fields=['is_paid', 'status', 'cashier', 'closed_at', 'updated_at'])
