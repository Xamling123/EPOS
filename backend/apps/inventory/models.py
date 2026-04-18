from django.db import models
from django.conf import settings

class InventoryItem(models.Model):
    """
    Represents an ingredient or item in stock.
    """
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('g', 'Gram'),
        ('l', 'Liter'),
        ('ml', 'Milliliter'),
        ('pcs', 'Pieces'),
        ('box', 'Box'),
    ]

    name = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='kg')
    low_stock_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=5.0)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.quantity} {self.unit})"

    def is_low_stock(self):
        return self.quantity <= self.low_stock_threshold


class StockTransaction(models.Model):
    """
    Records history of stock changes (purchases, usage, waste).
    """
    REASON_CHOICES = [
        ('purchase', 'Purchase / Restock'),
        ('usage', 'Usage (Order)'),
        ('waste', 'Waste / Spoilage'),
        ('correction', 'Inventory Correction'),
    ]

    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='transactions')
    change_amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Positive for addition, negative for deduction")
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.item.name}: {self.change_amount} ({self.reason})"
