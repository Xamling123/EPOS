"""
Role-Based Access Control (RBAC) permissions for the restaurant API.
"""

from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Permission class for Admin users only."""
    message = "Admin access required."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role == 'admin' or request.user.is_superuser)


class IsWaiter(BasePermission):
    """Permission class for Waiter users."""
    message = "Waiter access required."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role in ['admin', 'waiter'] or request.user.is_superuser)


class IsChef(BasePermission):
    """Permission class for Chef users."""
    message = "Chef access required."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role in ['admin', 'chef'] or request.user.is_superuser)


class IsCashier(BasePermission):
    """Permission class for Cashier users."""
    message = "Cashier access required."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role in ['admin', 'cashier'] or request.user.is_superuser)


class IsCustomer(BasePermission):
    """Permission class for Customer users."""
    message = "Customer access required."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'customer'


class IsStaff(BasePermission):
    """Permission class for any staff member (Admin, Waiter, Chef, Cashier)."""
    message = "Staff access required."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role in ['admin', 'waiter', 'chef', 'cashier'] or request.user.is_superuser)


class IsOwnerOrAdmin(BasePermission):
    """Permission that allows access to object owner or admin."""
    message = "You do not have permission to access this resource."
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        # Check if object has user or customer field
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'customer'):
            return obj.customer == request.user
        return False


class ReadOnlyOrAdmin(BasePermission):
    """Allow read access to all authenticated users, write access only to admin."""
    
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user.is_authenticated and request.user.role == 'admin'
