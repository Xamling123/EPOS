
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class OrderConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'orders_group'

        print(f"WebSocket Connect: {self.channel_name}")
        # Join room group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        print(f"WebSocket Disconnect: {close_code}")
        # Leave room group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        # We don't expect much receiving from client for now, mostly pushing updates
        pass

    # Receive message from room group
    async def order_update(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'order_update',
            'message': message
        }))

    async def item_update(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'item_update',
            'message': message
        }))
