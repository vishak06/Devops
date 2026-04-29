from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ExpenseViewSet, BudgetViewSet,
    MonthlyAnalyticsView, CategoryAnalyticsView,
    DashboardView, ExportCSVView,
)

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'budgets', BudgetViewSet, basename='budget')

urlpatterns = [
    path('', include(router.urls)),
    path('analytics/monthly/', MonthlyAnalyticsView.as_view(), name='analytics-monthly'),
    path('analytics/category/', CategoryAnalyticsView.as_view(), name='analytics-category'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('export/csv/', ExportCSVView.as_view(), name='export-csv'),
]
