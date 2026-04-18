from rest_framework import serializers
from .models import InventoryItem, StockTransaction

class StockTransactionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = StockTransaction
        fields = ['id', 'item', 'change_amount', 'reason', 'notes', 'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['created_by', 'created_at']


class InventoryItemSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = InventoryItem
        fields = ['id', 'name', 'quantity', 'unit', 'low_stock_threshold', 'cost_per_unit', 'is_low_stock', 'updated_at']
        read_only_fields = ['updated_at']
