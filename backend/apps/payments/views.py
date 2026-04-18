"""
Payment views for processing payments and mock gateway.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from core.permissions import IsCashier, IsAdmin, IsStaff
from .models import Payment
from .serializers import (
    PaymentSerializer,
    PaymentCreateSerializer,
    MockGatewaySerializer,
)
from apps.orders.models import Order


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for payment processing.
    - Cashier/Admin: Can process payments
    """
    queryset = Payment.objects.select_related('order', 'processed_by').all()
    serializer_class = PaymentSerializer
    permission_classes = [IsCashier]
    filterset_fields = ['status', 'payment_method', 'order']
    search_fields = ['transaction_id', 'order__id']
    ordering_fields = ['created_at', 'amount']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    def create(self, request, *args, **kwargs):
        """Process a payment."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()
        
        # For cash payments, auto-complete
        if payment.payment_method == 'cash':
            payment.complete()
        
        return Response({
            'success': True,
            'message': 'Payment processed successfully',
            'payment': PaymentSerializer(payment).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Manually complete a pending payment."""
        payment = self.get_object()
        
        if payment.status != 'pending':
            return Response({
                'success': False,
                'error': f'Cannot complete a payment with status: {payment.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        payment.complete()
        
        return Response({
            'success': True,
            'message': 'Payment completed successfully',
            'payment': PaymentSerializer(payment).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def refund(self, request, pk=None):
        """Refund a completed payment (Admin only)."""
        payment = self.get_object()
        
        if payment.status != 'completed':
            return Response({
                'success': False,
                'error': 'Can only refund completed payments'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        payment.status = 'refunded'
        payment.save()
        
        # Update order
        order = payment.order
        order.is_paid = False
        order.status = 'served'  # Revert to served
        order.save(update_fields=['is_paid', 'status', 'updated_at'])
        
        return Response({
            'success': True,
            'message': 'Payment refunded successfully',
            'payment': PaymentSerializer(payment).data
        })
    
    @action(detail=False, methods=['post'])
    def mock_gateway(self, request):
        """
        Mock payment gateway for Khalti/eSewa.
        Simulates payment gateway response for testing.
        """
        serializer = MockGatewaySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        try:
            order = Order.objects.get(pk=data['order_id'])
        except Order.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Order not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if order.is_paid:
            return Response({
                'success': False,
                'error': 'Order already paid'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mock gateway processing
        mock_success = data.get('mock_success', True)
        
        gateway_response = {
            'gateway': data['payment_method'],
            'timestamp': timezone.now().isoformat(),
            'mock': True
        }
        
        if mock_success:
            # Create payment record
            payment = Payment.objects.create(
                order=order,
                amount=data['amount'],
                payment_method=data['payment_method'],
                status='completed',
                gateway_response={
                    **gateway_response,
                    'status': 'success',
                    'message': 'Payment successful (mock)'
                },
                processed_by=request.user
            )
            
            # Update order
            order.is_paid = True
            order.status = 'closed'
            order.cashier = request.user
            order.closed_at = timezone.now()
            order.save(update_fields=['is_paid', 'status', 'cashier', 'closed_at', 'updated_at'])
            
            return Response({
                'success': True,
                'message': 'Mock payment successful',
                'payment': PaymentSerializer(payment).data,
                'gateway_response': gateway_response
            })
        else:
            # Simulate failure
            Payment.objects.create(
                order=order,
                amount=data['amount'],
                payment_method=data['payment_method'],
                status='failed',
                gateway_response={
                    **gateway_response,
                    'status': 'failed',
                    'message': 'Payment failed (mock simulation)'
                },
                processed_by=request.user
            )
            
            return Response({
                'success': False,
                'error': 'Mock payment failed',
                'gateway_response': {
                    **gateway_response,
                    'status': 'failed'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def summary(self, request):
        """Get payment summary/reports."""
        from django.db.models import Sum, Count
        
        today = timezone.now().date()
        
        # Today's payments
        today_payments = self.queryset.filter(
            created_at__date=today,
            status='completed'
        )
        
        today_total = today_payments.aggregate(total=Sum('amount'))['total'] or 0
        
        # By payment method
        by_method = self.queryset.filter(status='completed').values(
            'payment_method'
        ).annotate(
            count=Count('id'),
            total=Sum('amount')
        )
        
        return Response({
            'success': True,
            'summary': {
                'today': {
                    'count': today_payments.count(),
                    'total': str(today_total)
                },
                'by_method': list(by_method)
            }
        })
