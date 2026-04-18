"""
Payment serializers.
"""

from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payment records."""
    
    processed_by_name = serializers.CharField(
        source='processed_by.full_name', 
        read_only=True, 
        default=None
    )
    
    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'amount', 'payment_method', 'status',
            'transaction_id', 'gateway_response', 'processed_by',
            'processed_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'transaction_id', 'gateway_response', 'created_at', 'updated_at']


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for processing payments."""
    
    class Meta:
        model = Payment
        fields = ['order', 'amount', 'payment_method']
    
    def validate_order(self, value):
        if value.is_paid:
            raise serializers.ValidationError("This order has already been paid.")
        return value
    
    def validate(self, attrs):
        order = attrs['order']
        amount = attrs['amount']
        
        # Validate amount matches order total (allow partial payments in future)
        if amount != order.total_amount:
            raise serializers.ValidationError({
                'amount': f'Amount must match order total: Rs.{order.total_amount}'
            })
        
        return attrs
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user:
            validated_data['processed_by'] = request.user
        
        payment = Payment.objects.create(**validated_data)
        return payment


class MockGatewaySerializer(serializers.Serializer):
    """Serializer for mock payment gateway response."""
    
    order_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    payment_method = serializers.ChoiceField(choices=['khalti', 'esewa'])
    # Mock fields
    mock_success = serializers.BooleanField(default=True, help_text="Set to False to simulate failure")
