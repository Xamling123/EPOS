"""
Order views for order management, KDS, and billing.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count
from core.permissions import IsAdmin, IsWaiter, IsChef, IsCashier, IsStaff
from .models import Order, OrderItem
from .serializers import (
    OrderSerializer,
    OrderCreateSerializer,
    OrderStatusSerializer,
    OrderItemSerializer,
    OrderItemCreateSerializer,
    OrderItemStatusSerializer,
    BillingSerializer,
)


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for order management.
    - Customer: Can view their own orders and create pre-orders
    - Waiter: Can create/modify orders, view all orders
    - Chef: Can view orders for KDS
    - Cashier: Can view orders for billing
    """

    queryset = Order.objects.select_related(
        'table', 'reservation', 'waiter', 'cashier', 'customer'
    ).prefetch_related('items').all()
    serializer_class = OrderSerializer
    filterset_fields = ['status', 'order_type', 'table', 'is_paid']
    search_fields = ['table__table_number', 'customer__email']
    ordering_fields = ['created_at', 'total_amount', 'status']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'customer':
            return self.queryset.filter(customer=user)
        return self.queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]  # Customer can create pre-orders
        if self.action in ['update', 'partial_update']:
            return [IsWaiter()]
        if self.action == 'destroy':
            return [IsAdmin()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active (unpaid) orders."""
        orders = self.queryset.filter(is_paid=False).exclude(status='closed')
        serializer = self.get_serializer(orders, many=True)
        return Response({
            'success': True,
            'orders': serializer.data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsChef])
    def kitchen(self, request):
        """
        Kitchen Display System endpoint.
        Returns orders/items that need to be prepared.
        """
        from django.db.models import Case, When, Value, IntegerField
        
        orders = self.queryset.filter(
            status__in=['confirmed', 'preparing'],
            is_paid=False
        ).annotate(
            priority_val=Case(
                When(priority='high', then=Value(1)),
                When(priority='normal', then=Value(2)),
                When(priority='low', then=Value(3)),
                default=Value(2),
                output_field=IntegerField(),
            )
        ).order_by('priority_val', 'created_at')
        
        # Get items that need preparation
        pending_items = OrderItem.objects.filter(
            order__in=orders,
            status__in=['pending', 'preparing']
        ).select_related('order', 'order__table').order_by('created_at')
        
        return Response({
            'success': True,
            'pending_count': pending_items.count(),
            'orders': OrderSerializer(orders, many=True).data,
            'items': OrderItemSerializer(pending_items, many=True).data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsCashier])
    def billing_queue(self, request):
        """Get orders ready for billing (served but not paid)."""
        orders = self.queryset.filter(
            status__in=['served', 'ready'],
            is_paid=False
        ).order_by('created_at')
        
        serializer = self.get_serializer(orders, many=True)
        return Response({
            'success': True,
            'orders': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsWaiter])
    def add_item(self, request, pk=None):
        """Add item to an existing order."""
        order = self.get_object()
        
        if not order.is_editable():
            return Response({
                'success': False,
                'error': 'Cannot add items to a closed or paid order.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = OrderItemCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(order=order)
        
        order.calculate_totals()
        order.refresh_from_db()
        return Response({
            'success': True,
            'message': 'Item added successfully',
            'order': OrderSerializer(order).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsWaiter])
    def update_item_quantity(self, request, pk=None):
        """Update item quantity."""
        order = self.get_object()
        
        if not order.is_editable():
            return Response({'success': False, 'error': 'Cannot modify a closed or paid order.'}, status=status.HTTP_400_BAD_REQUEST)
        
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity')
        
        if not item_id or quantity is None:
            return Response({'success': False, 'error': 'item_id and quantity are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            quantity = int(quantity)
            if quantity < 1:
                return Response({'success': False, 'error': 'Quantity must be at least 1.'}, status=status.HTTP_400_BAD_REQUEST)
            
            item = order.items.get(pk=item_id)
            item.quantity = quantity
            item.save()  # This will recalculate totals via OrderItem.save()
            
            order.refresh_from_db()
            return Response({'success': True, 'order': OrderSerializer(order).data})
        except OrderItem.DoesNotExist:
            return Response({'success': False, 'error': 'Item not found in this order.'}, status=status.HTTP_404_NOT_FOUND)
        except (ValueError, TypeError):
            return Response({'success': False, 'error': 'Invalid quantity.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsWaiter])
    def remove_item(self, request, pk=None):
        """Remove an item from the order."""
        order = self.get_object()
        
        if not order.is_editable():
            return Response({'success': False, 'error': 'Cannot modify a closed or paid order.'}, status=status.HTTP_400_BAD_REQUEST)
        
        item_id = request.data.get('item_id')
        if not item_id:
            return Response({'success': False, 'error': 'item_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            item = order.items.get(pk=item_id)
            item.delete()
            order.calculate_totals()
            order.refresh_from_db()
            return Response({'success': True, 'order': OrderSerializer(order).data})
        except OrderItem.DoesNotExist:
            return Response({'success': False, 'error': 'Item not found in this order.'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'], permission_classes=[IsWaiter])
    def update_status(self, request, pk=None):
        """Update order status."""
        order = self.get_object()
        serializer = OrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        new_status = serializer.validated_data.get('status')
        new_priority = serializer.validated_data.get('priority')
        
        if order.is_paid and new_status and new_status != 'closed':
            return Response({
                'success': False,
                'error': 'Cannot change status of a paid order.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if new_status:
            order.status = new_status
            if new_status == 'closed':
                order.closed_at = timezone.now()
        
        if new_priority:
            order.priority = new_priority

        order.save(update_fields=['status', 'priority', 'closed_at', 'updated_at'])
        
        return Response({
            'success': True,
            'message': f'Order status updated to {new_status}',
            'order': OrderSerializer(order).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsChef])
    def update_item_status(self, request, pk=None):
        """Update individual item status (for KDS)."""
        order = self.get_object()
        item_id = request.data.get('item_id')
        
        if not item_id:
            return Response({
                'success': False,
                'error': 'item_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            item = order.items.get(pk=item_id)
        except OrderItem.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Item not found in this order'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = OrderItemStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        item.status = serializer.validated_data['status']
        item.save(update_fields=['status', 'updated_at'])
        
        # Auto-update order status if all items ready
        all_items_ready = not order.items.exclude(status__in=['ready', 'served', 'cancelled']).exists()
        if all_items_ready and order.status == 'preparing':
            order.status = 'ready'
            order.save(update_fields=['status', 'updated_at'])
        
        return Response({
            'success': True,
            'message': f'Item status updated to {item.status}',
            'item': OrderItemSerializer(item).data
        })
    
    @action(detail=True, methods=['get', 'post'], permission_classes=[IsCashier])
    def invoice(self, request, pk=None):
        """Generate invoice for an order."""
        order = self.get_object()
        
        if request.method == 'POST':
            serializer = BillingSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            if 'discount_amount' in serializer.validated_data:
                order.discount_amount = serializer.validated_data['discount_amount']
                order.calculate_totals()
        
        invoice_data = {
            'invoice_number': f'INV-{order.id:06d}',
            'order_id': order.id,
            'date': order.created_at.strftime('%Y-%m-%d %H:%M'),
            'table': order.table.table_number,
            'items': [
                {
                    'name': item.item_name,
                    'quantity': item.quantity,
                    'unit_price': str(item.unit_price),
                    'total': str(item.total_price)
                }
                for item in order.items.exclude(status='cancelled')
            ],
            'subtotal': str(order.subtotal),
            'tax_rate': f'{order.tax_rate}%',
            'tax_amount': str(order.tax_amount),
            'discount': str(order.discount_amount),
            'total': str(order.total_amount),
            'is_paid': order.is_paid
        }
        
        return Response({
            'success': True,
            'invoice': invoice_data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def reports(self, request):
        """Get order reports and analytics."""
        today = timezone.now().date()
        
        # Daily sales
        daily_orders = self.queryset.filter(
            created_at__date=today,
            is_paid=True
        )
        daily_total = daily_orders.aggregate(total=Sum('total_amount'))['total'] or 0
        
        # Most ordered items
        popular_items = OrderItem.objects.values('item_name').annotate(
            count=Count('id'),
            total_revenue=Sum('total_price')
        ).order_by('-count')[:10]
        
        # Orders by status
        status_counts = self.queryset.values('status').annotate(count=Count('id'))
        
        return Response({
            'success': True,
            'reports': {
                'daily_sales': {
                    'date': today,
                    'order_count': daily_orders.count(),
                    'total_revenue': str(daily_total)
                },
                'popular_items': list(popular_items),
                'orders_by_status': list(status_counts)
            }
        })
