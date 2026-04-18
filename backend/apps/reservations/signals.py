from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Reservation

@receiver(post_save, sender=Reservation)
def sync_pre_order_status(sender, instance, created, **kwargs):
    """
    Sync pre-order status with reservation status.
    - If reservation is confirmed/seated -> Order status = confirmed (Shows on KDS)
    - If reservation is cancelled/no_show -> Order status = cancelled
    """
    # Find orders linked to this reservation
    orders = instance.orders.all()
    
    if not orders.exists():
        return

    # Determine target order status based on reservation status
    target_status = None
    
    if instance.status in ['confirmed', 'seated']:
        # Move pending pre-orders to confirmed so they appear on KDS
        target_status = 'confirmed'
    elif instance.status in ['cancelled', 'no_show']:
        target_status = 'closed' # Or 'cancelled' if added to STATUS_CHOICES

    if target_status:
        for order in orders:
            # Only update if status is different and order isn't already processed further
            if order.status == 'pending' and target_status == 'confirmed':
                order.status = 'confirmed'
                order.save(update_fields=['status', 'updated_at'])
            elif target_status == 'closed' and not order.is_paid:
                order.status = 'closed'
                order.save(update_fields=['status', 'updated_at'])
