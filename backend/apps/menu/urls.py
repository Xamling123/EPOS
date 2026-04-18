"""
URL routes for menu app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuCategoryViewSet, MenuItemViewSet

router = DefaultRouter()
router.register('categories', MenuCategoryViewSet, basename='category')
router.register('items', MenuItemViewSet, basename='item')

urlpatterns = [
    path('', include(router.urls)),
]
