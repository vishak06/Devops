"""
URL configuration for finance_tracker project.
All API endpoints are prefixed with /api/.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('expenses.urls')),
]
