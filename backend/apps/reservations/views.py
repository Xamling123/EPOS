"""
Reservation views.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from core.permissions import IsAdmin, IsWaiter, IsStaff
from .models import Reservation
from .serializers import (
    ReservationSerializer,
    ReservationCreateSerializer,
    ReservationStatusUpdateSerializer,
)


class ReservationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for reservation management.
    - Customers: Can view their own reservations and create new ones
    - Staff: Can view all reservations
    - Admin/Waiter: Can update reservation status
    """
    queryset = Reservation.objects.select_related('user', 'table').all()
    serializer_class = ReservationSerializer
    filterset_fields = ['status', 'reservation_date', 'table']
    search_fields = ['user__email', 'user__first_name', 'table__table_number']
    ordering_fields = ['reservation_date', 'start_time', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'customer':
            return self.queryset.filter(user=user)
        return self.queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReservationCreateSerializer
        return ReservationSerializer
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsWaiter()]
        if self.action == 'update_status':
            return [IsWaiter()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def my_reservations(self, request):
        """Get current user's reservations."""
        reservations = self.queryset.filter(user=request.user)
        serializer = self.get_serializer(reservations, many=True)
        return Response({
            'success': True,
            'reservations': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming reservations (for staff dashboard)."""
        today = timezone.now().date()
        reservations = self.queryset.filter(
            reservation_date__gte=today,
            status__in=['pending', 'confirmed']
        ).order_by('reservation_date', 'start_time')
        
        serializer = self.get_serializer(reservations, many=True)
        return Response({
            'success': True,
            'reservations': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's reservations."""
        today = timezone.now().date()
        reservations = self.queryset.filter(reservation_date=today)
        serializer = self.get_serializer(reservations, many=True)
        return Response({
            'success': True,
            'date': today,
            'reservations': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsWaiter])
    def update_status(self, request, pk=None):
        """Update reservation status."""
        reservation = self.get_object()
        serializer = ReservationStatusUpdateSerializer(
            data=request.data,
            context={'reservation': reservation}
        )
        serializer.is_valid(raise_exception=True)
        
        reservation.status = serializer.validated_data['status']
        reservation.save()
        
        return Response({
            'success': True,
            'message': f'Reservation status updated to {reservation.status}',
            'reservation': ReservationSerializer(reservation).data
        })
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a reservation (can be done by owner or staff)."""
        reservation = self.get_object()
        
        # Check if user is owner or staff
        if request.user != reservation.user and request.user.role not in ['admin', 'waiter']:
            return Response({
                'success': False,
                'error': 'You do not have permission to cancel this reservation.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not reservation.can_be_cancelled():
            return Response({
                'success': False,
                'error': 'This reservation cannot be cancelled.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        reservation.cancel()
        
        return Response({
            'success': True,
            'message': 'Reservation cancelled successfully',
            'reservation': ReservationSerializer(reservation).data
        })
