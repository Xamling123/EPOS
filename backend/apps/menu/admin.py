from django.contrib import admin
from .models import MenuCategory, MenuItem

@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_order', 'is_active', 'created_at')
    list_editable = ('display_order', 'is_active')
    search_fields = ('name',)

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'is_available', 'created_at')
    list_filter = ('category', 'is_available', 'is_vegetarian', 'is_vegan', 'is_gluten_free')
    search_fields = ('name', 'description')
    list_editable = ('price', 'is_available')
