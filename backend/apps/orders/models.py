"""
Order models with snapshotted prices and edit restrictions.
Business Rules:
- Pre-orders must be linked to a valid reservation
- Item prices must be snapshotted at order time
- Closed/paid orders cannot be edited (read-only)
"""

from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from decimal import Decimal


class Order(models.Model):
    """
    Order model with status tracking.
    Business Rule: Closed/paid orders cannot be edited.
    """
    
    ORDER_TYPE_CHOICES = [
        ('dine_in', 'Dine In'),
        ('pre_order', 'Pre-Order'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('served', 'Served'),
        ('closed', 'Closed'),
    ]
    
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('normal', 'Normal'),
        ('low', 'Low'),
    ]

    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    
    reservation = models.ForeignKey(
        'reservations.Reservation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    table = models.ForeignKey(
        'tables.Table',
        on_delete=models.CASCADE,
        related_name='orders'
    )
    waiter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='waiter_orders',
        limit_choices_to={'role__in': ['admin', 'waiter']}
    )
    cashier = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cashier_orders',
        limit_choices_to={'role__in': ['admin', 'cashier']}
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='customer_orders',
        limit_choices_to={'role': 'customer'}
    )
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES, default='dine_in')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('13.00'))  # 13% VAT
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    is_paid = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['table', 'is_paid']),
        ]
    
    def __str__(self):
        return f"Order #{self.id} - Table {self.table.table_number}"
    
    def clean(self):
        """Validate order before saving."""
        # Pre-orders must be linked to a reservation
        if self.order_type == 'pre_order' and not self.reservation:
            raise ValidationError({
                'reservation': 'Pre-orders must be linked to a valid reservation.'
            })
        
        # Validate reservation belongs to table
        if self.reservation and self.table:
            if self.reservation.table != self.table:
                raise ValidationError({
                    'table': 'Order table must match reservation table.'
                })
    
    def save(self, *args, **kwargs):
        # Business Rule: Closed/paid orders cannot be edited
        if self.pk:
            original = Order.objects.filter(pk=self.pk).first()
            if original and original.is_paid:
                # Allow only specific field updates for paid orders
                allowed_updates = kwargs.get('update_fields', [])
                if not allowed_updates or not all(f in ['notes', 'cashier'] for f in allowed_updates):
                    raise ValidationError('Paid orders cannot be modified.')
        
        self.full_clean()
        super().save(*args, **kwargs)
    
    def calculate_totals(self):
        """Recalculate order totals from items."""
        items = self.items.filter(status__in=['pending', 'preparing', 'ready', 'served'])
        self.subtotal = sum(item.total_price for item in items)
        self.tax_amount = (self.subtotal * self.tax_rate / Decimal('100')).quantize(Decimal('0.01'))
        self.total_amount = self.subtotal + self.tax_amount - self.discount_amount
        self.save(update_fields=['subtotal', 'tax_amount', 'total_amount', 'updated_at'])
    
    def is_editable(self):
        """Check if order can be modified."""
        return not self.is_paid and self.status != 'closed'
    
    def close(self):
        """Mark order as closed."""
        from django.utils import timezone
        self.status = 'closed'
        self.closed_at = timezone.now()
        self.save(update_fields=['status', 'closed_at', 'updated_at'])


class OrderItem(models.Model):
    """
    Order item with snapshotted price.
    Business Rule: Item prices are captured at order time, independent of current menu price.
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('served', 'Served'),
        ('cancelled', 'Cancelled'),
    ]
    
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    menu_item = models.ForeignKey(
        'menu.MenuItem',
        on_delete=models.SET_NULL,
        null=True,
        related_name='order_items'
    )
    # Snapshotted values - captured at order time
    item_name = models.CharField(max_length=200)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    modifiers = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'order_items'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.quantity}x {self.item_name} @ Rs.{self.unit_price}"
    
    def save(self, *args, **kwargs):
        # Snapshot name and price from menu item if new
        if not self.pk and self.menu_item:
            self.item_name = self.menu_item.name
            self.unit_price = self.menu_item.price
        
        # Calculate total price
        self.total_price = self.unit_price * self.quantity
        
        # Validate order is editable (unless just updating status)
        if self.pk and self.order:
            update_fields = kwargs.get('update_fields', [])
            if not update_fields or 'status' not in update_fields:
                if not self.order.is_editable():
                    raise ValidationError('Cannot modify items in a closed/paid order.')
        
        super().save(*args, **kwargs)
        
        # Update order totals
        if self.order:
            self.order.calculate_totals()
