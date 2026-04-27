"""
URL patterns for the tracker API.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('add-transaction/', views.add_transaction, name='add-transaction'),
    path('transactions/', views.get_transactions, name='transactions'),
    path('balance/', views.get_balance, name='balance'),
]
