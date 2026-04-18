"""
Menu serializers.
"""

from rest_framework import serializers
from .models import MenuCategory, MenuItem


class MenuItemSerializer(serializers.ModelSerializer):
    """Serializer for menu items."""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = MenuItem
        fields = [
            'id', 'category', 'category_name', 'name', 'description', 'price',
            'image_url', 'is_available', 'is_vegetarian', 'is_vegan',
            'is_gluten_free', 'spice_level', 'preparation_time_mins',
            'calories', 'available_modifiers', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MenuCategorySerializer(serializers.ModelSerializer):
    """Serializer for menu categories."""
    
    items = MenuItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'description', 'display_order', 'is_active',
                  'item_count', 'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_item_count(self, obj):
        return obj.items.filter(is_available=True).count()


class MenuCategoryListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for category lists without items."""
    
    item_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'description', 'display_order', 'is_active', 'item_count']
    
    def get_item_count(self, obj):
        return obj.items.filter(is_available=True).count()
