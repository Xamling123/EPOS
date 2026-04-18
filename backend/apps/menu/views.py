"""
Menu views.
Business Rule: Only Admin can change menu pricing.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from core.permissions import IsAdmin, ReadOnlyOrAdmin
from .models import MenuCategory, MenuItem
from .serializers import (
    MenuCategorySerializer,
    MenuCategoryListSerializer,
    MenuItemSerializer,
)


class MenuCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for menu categories.
    - Public: Read-only access to active categories
    - Admin: Full CRUD access
    """
    queryset = MenuCategory.objects.all()
    permission_classes = [ReadOnlyOrAdmin]
    filterset_fields = ['is_active']
    search_fields = ['name']
    ordering_fields = ['display_order', 'name']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Non-admin users only see active categories
        if not self.request.user.is_authenticated or self.request.user.role != 'admin':
            queryset = queryset.filter(is_active=True)
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MenuCategoryListSerializer
        return MenuCategorySerializer
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def with_items(self, request):
        """Get all categories with their items."""
        categories = self.get_queryset().prefetch_related('items')
        serializer = MenuCategorySerializer(categories, many=True)
        return Response({
            'success': True,
            'categories': serializer.data
        })


class MenuItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for menu items.
    - Public: Read-only access to available items
    - Admin: Full CRUD access (including price changes)
    """
    queryset = MenuItem.objects.select_related('category').all()
    serializer_class = MenuItemSerializer
    permission_classes = [ReadOnlyOrAdmin]
    filterset_fields = ['category', 'is_available', 'is_vegetarian', 'is_vegan', 'is_gluten_free']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'category']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Non-admin users only see available items
        if not self.request.user.is_authenticated or self.request.user.role != 'admin':
            queryset = queryset.filter(is_available=True, category__is_active=True)
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def update_price(self, request, pk=None):
        """
        Update item price (Admin only).
        Business Rule: Only Admin can change menu pricing.
        """
        item = self.get_object()
        new_price = request.data.get('price')
        
        if new_price is None:
            return Response({
                'success': False,
                'error': 'Price is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            new_price = float(new_price)
            if new_price < 0:
                raise ValueError("Price cannot be negative")
        except (ValueError, TypeError) as e:
            return Response({
                'success': False,
                'error': 'Invalid price value'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        old_price = item.price
        item.price = new_price
        item.save()
        
        return Response({
            'success': True,
            'message': f'Price updated from Rs.{old_price} to Rs.{new_price}',
            'item': MenuItemSerializer(item).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def toggle_availability(self, request, pk=None):
        """Toggle item availability."""
        item = self.get_object()
        item.is_available = not item.is_available
        item.save()
        
        return Response({
            'success': True,
            'message': f'Item is now {"available" if item.is_available else "unavailable"}',
            'item': MenuItemSerializer(item).data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def popular(self, request):
        """Get popular/featured items."""
        # In a real app, this would be based on order frequency
        # For now, just return first 10 available items
        items = self.get_queryset()[:10]
        serializer = self.get_serializer(items, many=True)
        return Response({
            'success': True,
            'items': serializer.data
        })
