"""
Table views for table management and availability checking.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from core.permissions import IsAdmin, ReadOnlyOrAdmin, IsWaiter
from .models import Table
from .serializers import TableSerializer, TableAvailabilitySerializer


class TableViewSet(viewsets.ModelViewSet):
    """
    ViewSet for table management.
    - Admin: Full CRUD access
    - Others: Read-only access
    """
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    permission_classes = [ReadOnlyOrAdmin]
    filterset_fields = ['status', 'is_active', 'location']
    search_fields = ['table_number', 'location']
    ordering_fields = ['table_number', 'capacity', 'created_at']
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'availability':
            return [AllowAny()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get', 'post'], permission_classes=[AllowAny])
    def availability(self, request):
        """
        Check table availability for a specific date, time, and party size.
        Returns tables that are available (not reserved during the requested time slot).
        """
        if request.method == 'GET':
            serializer = TableAvailabilitySerializer(data=request.query_params)
        else:
            serializer = TableAvailabilitySerializer(data=request.data)
        
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        # Import here to avoid circular import
        from apps.reservations.models import Reservation
        
        # Find tables that have overlapping reservations
        overlapping_reservations = Reservation.objects.filter(
            reservation_date=data['date'],
            status__in=['pending', 'confirmed', 'seated'],
        ).filter(
            # Time overlap: (start1 < end2) AND (end1 > start2)
            Q(start_time__lt=data['end_time']) & Q(end_time__gt=data['start_time'])
        ).values_list('table_id', flat=True)
        
        # Get available tables with sufficient capacity
        available_tables = Table.objects.filter(
            is_active=True,
            capacity__gte=data['guest_count']
        ).exclude(
            id__in=overlapping_reservations
        ).exclude(
            status='maintenance'
        )
        
        return Response({
            'success': True,
            'date': data['date'],
            'start_time': data['start_time'],
            'end_time': data['end_time'],
            'guest_count': data['guest_count'],
            'available_tables': TableSerializer(available_tables, many=True).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin | IsWaiter])
    def update_status(self, request, pk=None):
        """Update table status (Admin only)."""
        table = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Table.STATUS_CHOICES):
            return Response({
                'success': False,
                'error': f'Invalid status. Must be one of: {list(dict(Table.STATUS_CHOICES).keys())}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        table.status = new_status
        table.save()
        
        return Response({
            'success': True,
            'message': f'Table status updated to {new_status}',
            'table': TableSerializer(table).data
        })
