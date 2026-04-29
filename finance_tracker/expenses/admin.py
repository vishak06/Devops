from django.contrib import admin
from .models import Expense, Budget


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'category', 'date', 'is_income', 'created_at')
    list_filter = ('category', 'is_income', 'date')
    search_fields = ('description', 'user__username')
    date_hierarchy = 'date'


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'monthly_limit', 'month')
    list_filter = ('category', 'month')
