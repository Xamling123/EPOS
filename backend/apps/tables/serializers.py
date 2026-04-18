"""
Table serializers.
"""

from rest_framework import serializers
from .models import Table


class TableSerializer(serializers.ModelSerializer):
    """Serializer for table data."""
    
    class Meta:
        model = Table
        fields = ['id', 'table_number', 'capacity', 'status', 'location', 
                  'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TableAvailabilitySerializer(serializers.Serializer):
    """Serializer for table availability query."""
    
    date = serializers.DateField(required=True)
    start_time = serializers.TimeField(required=True)
    end_time = serializers.TimeField(required=True)
    guest_count = serializers.IntegerField(required=True, min_value=1)
