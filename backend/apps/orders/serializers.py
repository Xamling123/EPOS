"""
Order serializers with validation.
"""

from rest_framework import serializers
from decimal import Decimal
from .models import Order, OrderItem
from apps.tables.serializers import TableSerializer
from apps.reservations.serializers import ReservationSerializer
from apps.menu.models import MenuItem


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items with snapshotted price display."""
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'order', 'menu_item', 'item_name', 'unit_price',
            'quantity', 'total_price', 'status', 'modifiers', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'item_name', 'unit_price', 'total_price', 'created_at']


class OrderItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating order items - snapshots price at creation."""
    
    class Meta:
        model = OrderItem
        fields = ['menu_item', 'quantity', 'modifiers', 'notes']
    
    def validate_menu_item(self, value):
        if not value.is_available:
            raise serializers.ValidationError("This item is currently unavailable.")
        return value
    
    def create(self, validated_data):
        menu_item = validated_data['menu_item']
        # Snapshot price and name at order time
        validated_data['item_name'] = menu_item.name
        validated_data['unit_price'] = menu_item.price
        validated_data['total_price'] = menu_item.price * validated_data['quantity']
        return super().create(validated_data)


class OrderItemStatusSerializer(serializers.Serializer):
    """Serializer for updating order item status (for KDS)."""
    status = serializers.ChoiceField(choices=OrderItem.STATUS_CHOICES)


class OrderSerializer(serializers.ModelSerializer):
    """Full order serializer with nested items."""
    
    items = OrderItemSerializer(many=True, read_only=True)
    table_details = TableSerializer(source='table', read_only=True)
    reservation_details = ReservationSerializer(source='reservation', read_only=True)
    waiter_name = serializers.CharField(source='waiter.full_name', read_only=True, default=None)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True, default=None)
    
    class Meta:
        model = Order
        fields = [
            'id', 'reservation', 'reservation_details', 'table', 'table_details',
            'waiter', 'waiter_name', 'cashier', 'customer', 'customer_name',
            'order_type', 'priority', 'status', 'subtotal', 'tax_rate', 'tax_amount',
            'discount_amount', 'total_amount', 'is_paid', 'notes', 'items',
            'created_at', 'updated_at', 'closed_at'
        ]
        read_only_fields = [
            'id', 'subtotal', 'tax_amount', 'total_amount', 
            'created_at', 'updated_at', 'closed_at'
        ]


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders."""
    
    items = OrderItemCreateSerializer(many=True, required=False)
    
    class Meta:
        model = Order
        fields = ['reservation', 'table', 'order_type', 'priority', 'notes', 'items']
        extra_kwargs = {
            'table': {'required': False},
        }
    
    def validate(self, attrs):
        # Business Rule: Pre-orders must be linked to a valid reservation
        if attrs.get('order_type') == 'pre_order' and not attrs.get('reservation'):
            raise serializers.ValidationError({
                'reservation': 'Pre-orders must be linked to a valid reservation.'
            })
        
        # Validate reservation matches table
        reservation = attrs.get('reservation')
        table = attrs.get('table')
        if reservation and table and reservation.table != table:
            raise serializers.ValidationError({
                'table': 'Order table must match reservation table.'
            })
        
        # Set table from reservation if not provided
        if reservation and not table:
            attrs['table'] = reservation.table
        
        return attrs
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        request = self.context.get('request')
        
        # Set waiter or customer based on user role
        if request and request.user:
            if request.user.role in ['admin', 'waiter']:
                validated_data['waiter'] = request.user
            elif request.user.role == 'customer':
                validated_data['customer'] = request.user
        
        order = Order.objects.create(**validated_data)
        
        # Create order items
        for item_data in items_data:
            menu_item = item_data['menu_item']
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                item_name=menu_item.name,
                unit_price=menu_item.price,
                quantity=item_data['quantity'],
                total_price=menu_item.price * item_data['quantity'],
                modifiers=item_data.get('modifiers', []),
                notes=item_data.get('notes', '')
            )
        
        if items_data:
            order.calculate_totals()
        
        return order


class OrderStatusSerializer(serializers.Serializer):
    """Serializer for updating order status."""
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES, required=False)
    priority = serializers.ChoiceField(choices=Order.PRIORITY_CHOICES, required=False)


class BillingSerializer(serializers.Serializer):
    """Serializer for generating invoice/bill."""
    
    discount_amount = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        required=False,
        min_value=Decimal('0')
    )
    notes = serializers.CharField(required=False, allow_blank=True)
