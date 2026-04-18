
from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Order, OrderItem

def send_order_update(message_type, data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "orders_group",
        {
            "type": message_type,
            "message": data
        }
    )

@receiver(post_save, sender=Order)
def order_saved(sender, instance, created, **kwargs):
    # Determine the event type
    event = "created" if created else "updated"
    
    data = {
        "event": event,
        "id": instance.id,
        "status": instance.status,
        "table": instance.table.table_number if instance.table else None,
        "priority": instance.priority,
        "created_at": instance.created_at.isoformat() if instance.created_at else None,
        "updated_at": instance.updated_at.isoformat() if instance.updated_at else None
    }
    send_order_update("order_update", data)

@receiver(post_save, sender=OrderItem)
def order_item_saved(sender, instance, created, **kwargs):
    data = {
        "id": instance.id,
        "order_id": instance.order.id,
        "status": instance.status,
        "item_name": instance.item_name,
        "quantity": instance.quantity
    }
    send_order_update("item_update", data)
