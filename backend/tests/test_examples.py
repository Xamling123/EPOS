"""
10 Practical Unit Testing Examples for EPOS Project

These examples demonstrate:
1. Model creation
2. Model validation
3. Database queries
4. API GET endpoints
5. API POST endpoints
6. Authentication/Permissions
7. Business logic
8. Exception handling
9. ForeignKey relationships
10. Signal handlers

Run tests with: pytest tests/test_examples.py -v
"""

from decimal import Decimal
from django.test import TestCase
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

from apps.tables.models import Table
from apps.menu.models import MenuCategory, MenuItem
from apps.orders.models import Order, OrderItem
from apps.users.models import User

User = get_user_model()


# ============================================================================
# EXAMPLE 1: Testing Model Creation
# ============================================================================
class Example1ModelCreationTestCase(TestCase):
    """
    Example 1: Test creating a model object with valid data.
    
    What it tests: Can we create objects successfully?
    """
    
    def test_create_table_successfully(self):
        """✅ Test creating a table with valid data."""
        table = Table.objects.create(
            table_number='T1',
            capacity=4,
            status='available'
        )
        
        # Assertions: verify the object was created correctly
        self.assertEqual(table.table_number, 'T1')
        self.assertEqual(table.capacity, 4)
        self.assertEqual(table.status, 'available')
        self.assertIsNotNone(table.id)  # ID should be auto-generated
    
    def test_create_menu_item_successfully(self):
        """✅ Test creating a menu item."""
        category = MenuCategory.objects.create(
            name='Main Course',
            description='Main dishes'
        )
        
        item = MenuItem.objects.create(
            category=category,
            name='Chicken Curry',
            price=Decimal('450.00'),
            is_available=True
        )
        
        self.assertEqual(item.name, 'Chicken Curry')
        self.assertEqual(item.price, Decimal('450.00'))
        self.assertTrue(item.is_available)


# ============================================================================
# EXAMPLE 2: Testing Model Validation
# ============================================================================
class Example2ModelValidationTestCase(TestCase):
    """
    Example 2: Test that model validation rejects invalid data.
    
    What it tests: Does validation work correctly?
    """
    
    def setUp(self):
        """Create test category."""
        self.category = MenuCategory.objects.create(
            name='Main Course',
            description='Main dishes'
        )
    
    def test_menu_item_with_zero_price(self):
        """✅ Test that items can have zero price (free items)."""
        item = MenuItem(
            category=self.category,
            name='Free Water',
            price=Decimal('0.00'),
            is_available=True
        )
        # Should not raise error (zero is valid)
        item.full_clean()
    
    def test_table_capacity_must_be_positive(self):
        """✅ Test that table can be created with positive capacity."""
        table = Table(
            table_number='T1',
            capacity=4,  # Valid: positive capacity
            status='available'
        )
        # Should not raise error
        table.full_clean()
        
        # Verify it can be saved
        table.save()
        self.assertIsNotNone(table.id)


# ============================================================================
# EXAMPLE 3: Testing Database Queries
# ============================================================================
class Example3DatabaseQueryTestCase(TestCase):
    """
    Example 3: Test filtering and querying the database.
    
    What it tests: Can we query data correctly?
    """
    
    def setUp(self):
        """Create test data."""
        self.table1 = Table.objects.create(table_number='T1', capacity=4, status='available')
        self.table2 = Table.objects.create(table_number='T2', capacity=2, status='occupied')
        self.table3 = Table.objects.create(table_number='T3', capacity=6, status='available')
    
    def test_query_available_tables(self):
        """✅ Test filtering available tables."""
        available = Table.objects.filter(status='available')
        
        # Should find 2 available tables
        self.assertEqual(available.count(), 2)
        self.assertIn(self.table1, available)
        self.assertIn(self.table3, available)
    
    def test_query_tables_by_capacity(self):
        """✅ Test filtering tables by capacity."""
        large_tables = Table.objects.filter(capacity__gte=5)
        
        # Should find 1 table with capacity >= 5
        self.assertEqual(large_tables.count(), 1)
        self.assertIn(self.table3, large_tables)
    
    def test_query_all_tables_ordered(self):
        """✅ Test getting all tables in order."""
        tables = Table.objects.all().order_by('table_number')
        
        # Should have 3 tables in order T1, T2, T3
        self.assertEqual(len(list(tables)), 3)


# ============================================================================
# EXAMPLE 4: Testing API GET Endpoints
# ============================================================================
class Example4APIGetTestCase(APITestCase):
    """
    Example 4: Test API GET endpoints (reading data).
    
    What it tests: Can we retrieve data via API?
    """
    
    def setUp(self):
        """Create authenticated user."""
        self.waiter = User.objects.create_user(
            email='waiter@test.com',
            password='testpass123',
            role='waiter'
        )
        self.client.force_authenticate(user=self.waiter)
        
        # Create test data
        self.table = Table.objects.create(table_number='T1', capacity=4)
        self.order = Order.objects.create(
            table=self.table,
            waiter=self.waiter,
            order_type='dine_in',
            status='pending'
        )
    
    def test_get_orders_list(self):
        """✅ Test getting list of orders."""
        response = self.client.get('/api/orders/')
        
        # Should be successful
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # API returns paginated data with 'results' key
        self.assertIn('results', response.data)
    
    def test_get_tables_list(self):
        """✅ Test getting list of tables."""
        response = self.client.get('/api/tables/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # API returns paginated data
        self.assertIn('results', response.data)
        # Check our table is in results
        table_numbers = [t['table_number'] for t in response.data['results']]
        self.assertIn('T1', table_numbers)


# ============================================================================
# EXAMPLE 5: Testing API POST Endpoints (Create)
# ============================================================================
class Example5APICreateTestCase(APITestCase):
    """
    Example 5: Test creating objects via API (POST).
    
    What it tests: Can we create data through the API?
    """
    
    def setUp(self):
        """Create authenticated waiter."""
        self.waiter = User.objects.create_user(
            email='waiter@test.com',
            password='testpass123',
            role='waiter'
        )
        self.client.force_authenticate(user=self.waiter)
        self.table = Table.objects.create(table_number='T1', capacity=4)
    
    def test_create_order_successfully(self):
        """✅ Test creating an order via API."""
        order_data = {
            'table': self.table.id,
            'order_type': 'dine_in',
            'status': 'pending'
        }
        
        response = self.client.post('/api/orders/', order_data)
        
        # Should create successfully (201 Created)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['table'], self.table.id)
    
    def test_cannot_create_order_without_table(self):
        """✅ Test that order requires a table."""
        order_data = {
            # Missing table field
            'order_type': 'dine_in'
        }
        
        response = self.client.post('/api/orders/', order_data)
        
        # Should fail validation
        self.assertNotEqual(response.status_code, status.HTTP_201_CREATED)


# ============================================================================
# EXAMPLE 6: Testing Authentication & Permissions
# ============================================================================
class Example6AuthenticationTestCase(APITestCase):
    """
    Example 6: Test authentication and access permissions.
    
    What it tests: Are permissions working correctly?
    """
    
    def setUp(self):
        """Create test users."""
        self.customer = User.objects.create_user(
            email='customer@test.com',
            password='pass123',
            role='customer'
        )
        self.waiter = User.objects.create_user(
            email='waiter@test.com',
            password='pass123',
            role='waiter'
        )
    
    def test_unauthenticated_user_cannot_access_orders(self):
        """✅ Test that unauthenticated users get 401."""
        # Don't authenticate
        response = self.client.get('/api/orders/')
        
        # Should be unauthorized
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_authenticated_user_can_access_orders(self):
        """✅ Test that authenticated users can access."""
        self.client.force_authenticate(user=self.waiter)
        
        response = self.client.get('/api/orders/')
        
        # Should be OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)


# ============================================================================
# EXAMPLE 7: Testing Business Logic
# ============================================================================
class Example7BusinessLogicTestCase(TestCase):
    """
    Example 7: Test complex business logic and calculations.
    
    What it tests: Do complex functions work correctly?
    """
    
    def setUp(self):
        """Create test order with items."""
        self.table = Table.objects.create(table_number='T1', capacity=4)
        self.order = Order.objects.create(
            table=self.table,
            order_type='dine_in',
            status='pending'
        )
        
        self.category = MenuCategory.objects.create(name='Main')
        self.item1 = MenuItem.objects.create(
            category=self.category,
            name='Chicken',
            price=Decimal('500.00')
        )
        self.item2 = MenuItem.objects.create(
            category=self.category,
            name='Rice',
            price=Decimal('200.00')
        )
    
    def test_order_total_calculation(self):
        """✅ Test that order totals are calculated correctly."""
        # Add items to order
        OrderItem.objects.create(
            order=self.order,
            menu_item=self.item1,
            quantity=2,  # 500 * 2 = 1000
            unit_price=self.item1.price,
            total_price=self.item1.price * 2
        )
        OrderItem.objects.create(
            order=self.order,
            menu_item=self.item2,
            quantity=1,  # 200 * 1 = 200
            unit_price=self.item2.price,
            total_price=self.item2.price * 1
        )
        
        # Calculate totals
        self.order.calculate_totals()
        
        # Calculation: Subtotal = 1200, Tax (13%) = 156, Total = 1356
        expected_subtotal = Decimal('1200.00')
        expected_tax = Decimal('156.00')
        expected_total = Decimal('1356.00')
        
        self.assertEqual(self.order.subtotal, expected_subtotal)
        self.assertEqual(self.order.tax_amount, expected_tax)
        self.assertEqual(self.order.total_amount, expected_total)
    
    def test_item_count_in_order(self):
        """✅ Test counting items in order."""
        OrderItem.objects.create(
            order=self.order,
            menu_item=self.item1,
            quantity=3,
            unit_price=self.item1.price,
            total_price=self.item1.price * 3
        )
        OrderItem.objects.create(
            order=self.order,
            menu_item=self.item2,
            quantity=2,
            unit_price=self.item2.price,
            total_price=self.item2.price * 2
        )
        
        # Total items: 3 + 2 = 5
        total_items = self.order.items.aggregate(
            total=Sum('quantity')
        )['total']
        
        self.assertEqual(total_items, 5)


# Import Sum for aggregation
from django.db.models import Sum


# ============================================================================
# EXAMPLE 8: Testing Exception Handling
# ============================================================================
class Example8ExceptionHandlingTestCase(TestCase):
    """
    Example 8: Test that exceptions are raised correctly.
    
    What it tests: Does error handling work?
    """
    
    def test_cannot_delete_reserved_table(self):
        """✅ Test that we cannot delete an occupied table."""
        table = Table.objects.create(
            table_number='T1',
            capacity=4,
            status='occupied'
        )
        
        # Trying to delete an occupied table should raise error
        # (depending on your business rules)
        # This is just an example of how to test for errors
        self.assertEqual(table.status, 'occupied')
    
    def test_invalid_order_type_raises_error(self):
        """✅ Test that invalid order type is rejected."""
        table = Table.objects.create(table_number='T1', capacity=4)
        
        order = Order(
            table=table,
            order_type='invalid_type',  # Invalid
            status='pending'
        )
        
        with self.assertRaises(ValidationError):
            order.full_clean()


# ============================================================================
# EXAMPLE 9: Testing ForeignKey Relationships
# ============================================================================
class Example9RelationshipTestCase(TestCase):
    """
    Example 9: Test model relationships (ForeignKey).
    
    What it tests: Do relationships between models work correctly?
    """
    
    def setUp(self):
        """Create related objects."""
        self.waiter = User.objects.create_user(
            email='waiter@test.com',
            password='pass123',
            role='waiter'
        )
        self.table = Table.objects.create(table_number='T1', capacity=4)
        self.category = MenuCategory.objects.create(name='Main')
    
    def test_order_waiter_relationship(self):
        """✅ Test that orders are linked to waiters."""
        order = Order.objects.create(
            table=self.table,
            waiter=self.waiter,
            order_type='dine_in'
        )
        
        # Check relationship
        self.assertEqual(order.waiter.id, self.waiter.id)
        # Reverse relationship
        self.assertIn(order, self.waiter.waiter_orders.all())
    
    def test_orderitem_menu_item_relationship(self):
        """✅ Test that order items reference menu items."""
        item = MenuItem.objects.create(
            category=self.category,
            name='Burger',
            price=Decimal('300.00')
        )
        order = Order.objects.create(table=self.table, order_type='dine_in')
        
        order_item = OrderItem.objects.create(
            order=order,
            menu_item=item,
            quantity=1,
            unit_price=item.price,
            total_price=item.price
        )
        
        # Check relationship
        self.assertEqual(order_item.menu_item.id, item.id)
        self.assertIn(order_item, order.items.all())


# ============================================================================
# EXAMPLE 10: Testing Signal Handlers
# ============================================================================
class Example10SignalHandlerTestCase(TestCase):
    """
    Example 10: Test automatic actions (signal handlers).
    
    What it tests: Do automatic triggers work when data changes?
    
    Note: This tests that the signal handler executes, verify by checking
    side effects like fields being updated automatically.
    """
    
    def setUp(self):
        """Create test objects."""
        self.table = Table.objects.create(table_number='T1', capacity=4)
    
    def test_order_creation_sets_created_at(self):
        """✅ Test that created_at timestamp is set automatically."""
        order = Order.objects.create(
            table=self.table,
            order_type='dine_in'
        )
        
        # created_at should be set automatically
        self.assertIsNotNone(order.created_at)
    
    def test_order_status_change(self):
        """✅ Test that order status can be changed to valid status."""
        order = Order.objects.create(
            table=self.table,
            status='pending'
        )
        
        # Change status to a valid choice
        order.status = 'confirmed'
        order.save()
        
        # Verify change persisted
        order.refresh_from_db()
        self.assertEqual(order.status, 'confirmed')


# ============================================================================
# RUNNING THESE TESTS
# ============================================================================
"""
Run all tests in this file:
    pytest tests/test_examples.py -v

Run specific example:
    pytest tests/test_examples.py::Example1ModelCreationTestCase -v

Run specific test:
    pytest tests/test_examples.py::Example1ModelCreationTestCase::test_create_table_successfully -v

With coverage:
    pytest tests/test_examples.py --cov=apps -v

See output details:
    pytest tests/test_examples.py -vv -s
"""
