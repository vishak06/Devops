import csv
from datetime import datetime, date
from decimal import Decimal

from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth
from django.http import HttpResponse
from rest_framework import viewsets, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import Expense, Budget
from .serializers import ExpenseSerializer, BudgetSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    Full CRUD ViewSet for expenses.
    Only returns expenses belonging to the authenticated user.
    Supports search, filtering by category and date range.
    """
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_income']
    search_fields = ['description', 'category']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date']

    def get_queryset(self):
        qs = Expense.objects.filter(user=self.request.user)
        # Custom date range filtering
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        return qs


class BudgetViewSet(viewsets.ModelViewSet):
    """CRUD ViewSet for budgets. User-scoped."""
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Budget.objects.filter(user=self.request.user)
        month = self.request.query_params.get('month')
        if month:
            qs = qs.filter(month=month)
        return qs


class MonthlyAnalyticsView(APIView):
    """
    Returns monthly aggregated income and expenses for the last 12 months.
    Response: [{ month, income, expense, net }, ...]
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Get last 12 months of data
        data = (
            Expense.objects.filter(user=user)
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(
                total_income=Sum('amount', filter=Q(is_income=True)),
                total_expense=Sum('amount', filter=Q(is_income=False)),
                count=Count('id'),
            )
            .order_by('month')
        )

        results = []
        for entry in data:
            income = float(entry['total_income'] or 0)
            expense = float(entry['total_expense'] or 0)
            results.append({
                'month': entry['month'].strftime('%Y-%m'),
                'month_label': entry['month'].strftime('%b %Y'),
                'income': income,
                'expense': expense,
                'net': income - expense,
                'count': entry['count'],
            })

        return Response(results)


class CategoryAnalyticsView(APIView):
    """
    Returns category-wise spending breakdown for a given month (or all time).
    Query params: ?month=2026-04
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = Expense.objects.filter(user=user, is_income=False)

        # Optional month filter
        month = request.query_params.get('month')
        if month:
            try:
                year, m = month.split('-')
                qs = qs.filter(date__year=int(year), date__month=int(m))
            except (ValueError, AttributeError):
                pass

        data = (
            qs.values('category')
            .annotate(total=Sum('amount'), count=Count('id'))
            .order_by('-total')
        )

        # Map category keys to display names
        category_map = dict(Expense.CATEGORY_CHOICES)
        results = []
        for entry in data:
            results.append({
                'category': entry['category'],
                'category_display': category_map.get(entry['category'], entry['category']),
                'total': float(entry['total']),
                'count': entry['count'],
            })

        return Response(results)


class DashboardView(APIView):
    """
    Returns dashboard summary data:
    - Total balance (income - expenses)
    - This month's income and expense
    - Recent transactions (last 5)
    - Budget alerts (overspending)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()

        # All-time totals
        totals = Expense.objects.filter(user=user).aggregate(
            total_income=Sum('amount', filter=Q(is_income=True)),
            total_expense=Sum('amount', filter=Q(is_income=False)),
        )
        total_income = float(totals['total_income'] or 0)
        total_expense = float(totals['total_expense'] or 0)

        # This month totals
        month_totals = Expense.objects.filter(
            user=user, date__year=today.year, date__month=today.month
        ).aggregate(
            month_income=Sum('amount', filter=Q(is_income=True)),
            month_expense=Sum('amount', filter=Q(is_income=False)),
        )
        month_income = float(month_totals['month_income'] or 0)
        month_expense = float(month_totals['month_expense'] or 0)

        # Recent transactions
        recent = Expense.objects.filter(user=user)[:5]
        recent_data = ExpenseSerializer(recent, many=True).data

        # Budget alerts
        budgets = Budget.objects.filter(
            user=user, month__year=today.year, month__month=today.month
        )
        budget_alerts = []
        for budget in budgets:
            spent = Expense.objects.filter(
                user=user, category=budget.category, is_income=False,
                date__year=today.year, date__month=today.month,
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
            if spent > budget.monthly_limit:
                budget_alerts.append({
                    'category': budget.category,
                    'category_display': budget.get_category_display(),
                    'limit': float(budget.monthly_limit),
                    'spent': float(spent),
                    'over_by': float(spent - budget.monthly_limit),
                })

        return Response({
            'balance': total_income - total_expense,
            'total_income': total_income,
            'total_expense': total_expense,
            'month_income': month_income,
            'month_expense': month_expense,
            'recent_transactions': recent_data,
            'budget_alerts': budget_alerts,
        })


class ExportCSVView(APIView):
    """Export all user expenses as a CSV file."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expenses = Expense.objects.filter(user=request.user)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = (
            f'attachment; filename="expenses_{date.today().isoformat()}.csv"'
        )

        writer = csv.writer(response)
        writer.writerow(['Date', 'Category', 'Amount', 'Type', 'Description'])
        for exp in expenses:
            writer.writerow([
                exp.date.isoformat(),
                exp.get_category_display(),
                str(exp.amount),
                'Income' if exp.is_income else 'Expense',
                exp.description,
            ])

        return response
