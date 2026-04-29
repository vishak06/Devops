from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal


class Expense(models.Model):
    """Represents a single expense transaction."""

    CATEGORY_CHOICES = [
        ('food', 'Food & Dining'),
        ('transport', 'Transportation'),
        ('entertainment', 'Entertainment'),
        ('shopping', 'Shopping'),
        ('bills', 'Bills & Utilities'),
        ('health', 'Health & Medical'),
        ('education', 'Education'),
        ('travel', 'Travel'),
        ('income', 'Income'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='expenses'
    )
    amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text='Transaction amount in user currency.',
    )
    category = models.CharField(
        max_length=20, choices=CATEGORY_CHOICES, default='other'
    )
    date = models.DateField(help_text='Date of the transaction.')
    description = models.TextField(blank=True, default='')
    is_income = models.BooleanField(
        default=False,
        help_text='True if this is an income entry, False for expense.',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', '-date']),
            models.Index(fields=['user', 'category']),
        ]

    def __str__(self):
        kind = 'Income' if self.is_income else 'Expense'
        return f"{kind}: {self.amount} — {self.get_category_display()} ({self.date})"


class Budget(models.Model):
    """Monthly budget limit per category for a user."""

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='budgets'
    )
    category = models.CharField(
        max_length=20, choices=Expense.CATEGORY_CHOICES
    )
    monthly_limit = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(Decimal('1.00'))],
    )
    month = models.DateField(
        help_text='First day of the month this budget applies to.'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'category', 'month')
        ordering = ['-month']

    def __str__(self):
        return f"Budget: {self.category} — ₹{self.monthly_limit} ({self.month.strftime('%b %Y')})"
