"""
Menu models for categories and items.
"""

from django.db import models


class MenuCategory(models.Model):
    """Category for grouping menu items."""
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'menu_categories'
        verbose_name_plural = 'Menu Categories'
        ordering = ['display_order', 'name']
    
    def __str__(self):
        return self.name


class MenuItem(models.Model):
    """
    Menu item with pricing.
    Business Rule: Only Admin can change menu pricing.
    """
    
    category = models.ForeignKey(
        MenuCategory,
        on_delete=models.CASCADE,
        related_name='items'
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_vegetarian = models.BooleanField(default=False)
    is_vegan = models.BooleanField(default=False)
    is_gluten_free = models.BooleanField(default=False)
    spice_level = models.PositiveSmallIntegerField(
        default=0, 
        help_text="0 = Not spicy, 1-3 = Mild to Hot"
    )
    preparation_time_mins = models.PositiveIntegerField(
        default=15,
        help_text="Estimated preparation time in minutes"
    )
    calories = models.PositiveIntegerField(null=True, blank=True)
    available_modifiers = models.JSONField(default=dict, blank=True, help_text="List of available modifiers")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'menu_items'
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['category', 'is_available']),
        ]
    
    def __str__(self):
        return f"{self.name} - Rs.{self.price}"
