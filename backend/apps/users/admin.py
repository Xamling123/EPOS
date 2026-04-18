from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, AuditLog

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Admin configuration for Custom User model.
    Adds 'role' filter and displays relevant fields.
    """
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_active', 'groups')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    
    # Custom fieldsets to include 'role'
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'entity_type', 'created_at')
    list_filter = ('action', 'entity_type', 'created_at')
    search_fields = ('user__email', 'action')
    reading_only_fields = ('created_at',)
