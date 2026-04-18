"""
Reservation serializers with validation.
"""

from rest_framework import serializers
from django.utils import timezone
from .models import Reservation
from apps.tables.serializers import TableSerializer
from apps.users.serializers import UserSerializer


class ReservationSerializer(serializers.ModelSerializer):
    """Serializer for reservation data."""
    
    table_details = TableSerializer(source='table', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'user', 'user_details', 'table', 'table_details',
            'reservation_date', 'start_time', 'end_time', 'guest_count',
            'status', 'special_requests', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        # Validate that reservation date is not in the past
        reservation_date = attrs.get('reservation_date')
        if reservation_date and reservation_date < timezone.now().date():
            raise serializers.ValidationError({
                'reservation_date': 'Cannot make a reservation for a past date.'
            })
        
        # Validate time order
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')
        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError({
                'end_time': 'End time must be after start time.'
            })
        
        return attrs


class ReservationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reservations."""
    
    class Meta:
        model = Reservation
        fields = ['id', 'table', 'reservation_date', 'start_time', 'end_time', 
                  'guest_count', 'special_requests']
    
    def validate(self, attrs):
        # Validate that reservation date is not in the past
        if attrs['reservation_date'] < timezone.now().date():
            raise serializers.ValidationError({
                'reservation_date': 'Cannot make a reservation for a past date.'
            })
        
        # Validate time order
        if attrs['start_time'] >= attrs['end_time']:
            raise serializers.ValidationError({
                'end_time': 'End time must be after start time.'
            })
        
        # Validate table capacity
        table = attrs['table']
        guest_count = attrs['guest_count']
        if guest_count > table.capacity:
            raise serializers.ValidationError({
                'guest_count': f'Guest count ({guest_count}) exceeds table capacity ({table.capacity}).'
            })
        
        # Check for overlapping reservations
        overlapping = Reservation.objects.filter(
            table=table,
            reservation_date=attrs['reservation_date'],
            status__in=['pending', 'confirmed', 'seated'],
            start_time__lt=attrs['end_time'],
            end_time__gt=attrs['start_time'],
        )
        
        if overlapping.exists():
            conflicting = overlapping.first()
            raise serializers.ValidationError({
                'table': f'Table {table.table_number} is already reserved from '
                         f'{conflicting.start_time} to {conflicting.end_time} on this date.'
            })
        
        return attrs
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ReservationStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating reservation status."""
    
    status = serializers.ChoiceField(choices=Reservation.STATUS_CHOICES)
    
    def validate_status(self, value):
        reservation = self.context.get('reservation')
        if reservation:
            current_status = reservation.status
            # Define valid status transitions
            valid_transitions = {
                'pending': ['confirmed', 'cancelled'],
                'confirmed': ['seated', 'cancelled', 'no_show'],
                'seated': ['completed'],
                'completed': [],
                'cancelled': [],
                'no_show': [],
            }
            
            if value not in valid_transitions.get(current_status, []):
                raise serializers.ValidationError(
                    f"Cannot transition from '{current_status}' to '{value}'."
                )
        
        return value
