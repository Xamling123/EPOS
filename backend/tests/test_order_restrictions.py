"""
Tests for order edit restrictions.
Business Rule: Closed/paid orders cannot be edited (read-only).
"""

from django.test import TestCase
from django.core.exceptions import ValidationError
from decimal import Decimal
from datetime import date, time, timedelta
from apps.users.models import User
from apps.tables.models import Table
from apps.menu.models import MenuCategory, MenuItem
from apps.orders.models import Order, OrderItem


class OrderEditRestrictionTestCase(TestCase):
    """Test cases for order edit restrictions."""
    
    def setUp(self):
        """Set up test data."""
        # Create users
        self.waiter = User.objects.create_user(
            email='waiter@test.com',
            password='testpass123',
            first_name='Test',
            last_name='Waiter',
            role='waiter'
        )
        
        self.cashier = User.objects.create_user(
            email='cashier@test.com',
            password='testpass123',
            first_name='Test',
            last_name='Cashier',
            role='cashier'
        )
        
        # Create table
        self.table = Table.objects.create(
            table_number='T1',
            capacity=4,
            status='available'
        )
        
        # Create menu items
        self.category = MenuCategory.objects.create(
            name='Main Course',
            description='Main dishes'
        )
        
        self.menu_item = MenuItem.objects.create(
            category=self.category,
            name='Chicken Curry',
            price=Decimal('450.00'),
            is_available=True
        )
    
    def create_order_with_item(self, is_paid=False, status='pending'):
        """Helper to create an order with an item."""
        order = Order(
            table=self.table,
            waiter=self.waiter,
            order_type='dine_in',
            status=status,
            is_paid=is_paid
        )
        # Bypass validation for paid orders in setup
        order.save()
        
        OrderItem.objects.create(
            order=order,
            menu_item=self.menu_item,
            item_name=self.menu_item.name,
            unit_price=self.menu_item.price,
            quantity=2,
            total_price=self.menu_item.price * 2
        )
        
        order.calculate_totals()
        return order
    
    def test_unpaid_order_can_be_modified(self):
        """Test that unpaid orders can be modified."""
        order = self.create_order_with_item(is_paid=False)
        
        # Should be able to add notes
        order.notes = "Rush order"
        order.save()
        
        order.refresh_from_db()
        self.assertEqual(order.notes, "Rush order")
    
    def test_unpaid_order_can_add_items(self):
        """Test that items can be added to unpaid orders."""
        order = self.create_order_with_item(is_paid=False)
        
        # Create another menu item
        new_item = MenuItem.objects.create(
            category=self.category,
            name='Rice',
            price=Decimal('100.00'),
            is_available=True
        )
        
        # Add item to order
        OrderItem.objects.create(
            order=order,
            menu_item=new_item,
            item_name=new_item.name,
            unit_price=new_item.price,
            quantity=1,
            total_price=new_item.price
        )
        
        self.assertEqual(order.items.count(), 2)
    
    def test_paid_order_cannot_be_modified(self):
        """Test that paid orders cannot be modified."""
        order = self.create_order_with_item(is_paid=False)
        
        # Mark as paid
        order.is_paid = True
        order.status = 'closed'
        order.save()
        
        # Try to modify the order
        order.notes = "Trying to modify paid order"
        
        with self.assertRaises(ValidationError):
            order.save()
    
    def test_paid_order_items_cannot_be_added(self):
        """Test that items cannot be added to paid orders."""
        order = self.create_order_with_item(is_paid=False)
        
        # Mark as paid
        order.is_paid = True
        order.status = 'closed'
        order.save()
        
        # Try to add item
        new_item = MenuItem.objects.create(
            category=self.category,
            name='Dessert',
            price=Decimal('150.00'),
            is_available=True
        )
        
        with self.assertRaises(ValidationError):
            OrderItem.objects.create(
                order=order,
                menu_item=new_item,
                item_name=new_item.name,
                unit_price=new_item.price,
                quantity=1,
                total_price=new_item.price
            )
    
    def test_is_editable_returns_false_for_paid_orders(self):
        """Test is_editable() method returns False for paid orders."""
        order = self.create_order_with_item(is_paid=False)
        self.assertTrue(order.is_editable())
        
        order.is_paid = True
        order.status = 'closed'
        order.save()
        
        self.assertFalse(order.is_editable())
    
    def test_is_editable_returns_false_for_closed_orders(self):
        """Test is_editable() returns False for closed orders even if not paid."""
        order = self.create_order_with_item(is_paid=False, status='closed')
        
        self.assertFalse(order.is_editable())
    
    def test_item_status_can_be_updated_on_paid_order(self):
        """Test that item status updates are still allowed for KDS tracking."""
        order = self.create_order_with_item(is_paid=False)
        item = order.items.first()
        
        # Mark as paid
        order.is_paid = True
        order.status = 'closed'
        order.save()
        
        # Item status update should work (for historical record keeping)
        item.status = 'served'
        item.save(update_fields=['status', 'updated_at'])
        
        item.refresh_from_db()
        self.assertEqual(item.status, 'served')


class PriceSnapshotTestCase(TestCase):
    """Test cases for price snapshotting."""
    
    def setUp(self):
        """Set up test data."""
        self.waiter = User.objects.create_user(
            email='waiter@test.com',
            password='testpass123',
            first_name='Test',
            last_name='Waiter',
            role='waiter'
        )
        
        self.table = Table.objects.create(
            table_number='T1',
            capacity=4,
            status='available'
        )
        
        self.category = MenuCategory.objects.create(
            name='Main Course',
            description='Main dishes'
        )
        
        self.menu_item = MenuItem.objects.create(
            category=self.category,
            name='Pizza',
            price=Decimal('500.00'),
            is_available=True
        )
    
    def test_price_is_snapshotted_at_order_time(self):
        """Test that item price is captured at order time."""
        original_price = Decimal('500.00')
        
        # Create order with item
        order = Order.objects.create(
            table=self.table,
            waiter=self.waiter,
            order_type='dine_in',
            status='pending'
        )
        
        order_item = OrderItem.objects.create(
            order=order,
            menu_item=self.menu_item,
            quantity=2
        )
        
        # Verify snapshotted price
        self.assertEqual(order_item.unit_price, original_price)
        self.assertEqual(order_item.item_name, 'Pizza')
        
        # Change menu price
        self.menu_item.price = Decimal('600.00')
        self.menu_item.save()
        
        # Order item price should remain unchanged
        order_item.refresh_from_db()
        self.assertEqual(order_item.unit_price, original_price)
        self.assertEqual(order_item.total_price, original_price * 2)
    
    def test_total_price_calculated_correctly(self):
        """Test that total price is calculated from snapshotted unit price."""
        order = Order.objects.create(
            table=self.table,
            waiter=self.waiter,
            order_type='dine_in',
            status='pending'
        )
        
        order_item = OrderItem.objects.create(
            order=order,
            menu_item=self.menu_item,
            quantity=3
        )
        
        expected_total = self.menu_item.price * 3
        self.assertEqual(order_item.total_price, expected_total)
    
    def test_order_totals_calculated_from_items(self):
        """Test that order totals are calculated from item totals."""
        order = Order.objects.create(
            table=self.table,
            waiter=self.waiter,
            order_type='dine_in',
            status='pending'
        )
        
        # Add multiple items
        OrderItem.objects.create(
            order=order,
            menu_item=self.menu_item,
            quantity=2  # 500 * 2 = 1000
        )
        
        another_item = MenuItem.objects.create(
            category=self.category,
            name='Pasta',
            price=Decimal('400.00'),
            is_available=True
        )
        
        OrderItem.objects.create(
            order=order,
            menu_item=another_item,
            quantity=1  # 400 * 1 = 400
        )
        
        order.refresh_from_db()
        
        expected_subtotal = Decimal('1400.00')  # 1000 + 400
        expected_tax = (expected_subtotal * Decimal('13') / Decimal('100')).quantize(Decimal('0.01'))
        expected_total = expected_subtotal + expected_tax
        
        self.assertEqual(order.subtotal, expected_subtotal)
        self.assertEqual(order.tax_amount, expected_tax)
        self.assertEqual(order.total_amount, expected_total)
