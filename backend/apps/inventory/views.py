from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.inventory.models import InventoryItem, StockTransaction
from apps.inventory.serializers import InventoryItemSerializer, StockTransactionSerializer
from core.permissions import IsAdmin, IsStaff
from django.db import models

class InventoryViewSet(viewsets.ModelViewSet):
    """
    Manage Inventory Items.
    Admin can CRUD everything.
    Staff can view and update stock.
    """
    queryset = InventoryItem.objects.all().order_by('name')
    serializer_class = InventoryItemSerializer
    permission_classes = [IsStaff]

    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        """
        Record a stock transaction (add/remove).
        """
        item = self.get_object()
        change_amount = request.data.get('change_amount')
        reason = request.data.get('reason')
        notes = request.data.get('notes', '')

        if change_amount is None or reason is None:
            return Response({'error': 'change_amount and reason are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            change_amount = float(change_amount)
        except ValueError:
            return Response({'error': 'Invalid change_amount'}, status=status.HTTP_400_BAD_REQUEST)

        # Create Transaction
        transaction = StockTransaction.objects.create(
            item=item,
            change_amount=change_amount,
            reason=reason,
            notes=notes,
            created_by=request.user
        )

        # Update Item Quantity
        from decimal import Decimal
        item.quantity = models.F('quantity') + Decimal(str(change_amount))
        item.save()
        item.refresh_from_db()

        return Response({
            'success': True,
            'new_quantity': item.quantity,
            'transaction': StockTransactionSerializer(transaction).data
        })

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """
        Get transaction history for an item.
        """
        item = self.get_object()
        transactions = item.transactions.all().order_by('-created_at')
        page = self.paginate_queryset(transactions)
        if page is not None:
            serializer = StockTransactionSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = StockTransactionSerializer(transactions, many=True)
        return Response(serializer.data)
