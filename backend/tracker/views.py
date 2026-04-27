"""
API views for the Daily Expense Tracker.

Endpoints:
  POST /api/add-transaction/  — Create a new transaction
  GET  /api/transactions/     — List transactions (optional ?category= filter)
  GET  /api/balance/          — Get total income, expense, and balance
"""

import json
from datetime import date

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Sum, Q

from .models import Transaction


@require_http_methods(["POST"])
def add_transaction(request):
    """Create a new transaction from JSON body."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    # Validate required fields
    required = ['amount', 'transaction_type', 'category', 'date']
    for field in required:
        if field not in data:
            return JsonResponse({'error': f'Missing required field: {field}'}, status=400)

    # Validate transaction_type
    valid_types = ['income', 'expense']
    if data['transaction_type'] not in valid_types:
        return JsonResponse(
            {'error': f'Invalid transaction_type. Must be one of: {valid_types}'},
            status=400,
        )

    # Validate category
    valid_categories = [c[0] for c in Transaction.CATEGORY_CHOICES]
    if data['category'] not in valid_categories:
        return JsonResponse(
            {'error': f'Invalid category. Must be one of: {valid_categories}'},
            status=400,
        )

    # Validate amount
    try:
        amount = float(data['amount'])
        if amount <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return JsonResponse({'error': 'Amount must be a positive number'}, status=400)

    # Validate date
    try:
        txn_date = date.fromisoformat(data['date'])
    except (ValueError, TypeError):
        return JsonResponse({'error': 'Date must be in YYYY-MM-DD format'}, status=400)

    # Create transaction
    transaction = Transaction.objects.create(
        amount=amount,
        transaction_type=data['transaction_type'],
        category=data['category'],
        date=txn_date,
        description=data.get('description', ''),
    )

    return JsonResponse({
        'message': 'Transaction added successfully',
        'transaction': {
            'id': transaction.id,
            'amount': str(transaction.amount),
            'transaction_type': transaction.transaction_type,
            'category': transaction.category,
            'date': str(transaction.date),
            'description': transaction.description,
        }
    }, status=201)


@require_http_methods(["GET"])
def get_transactions(request):
    """List all transactions. Optional query param: ?category=food"""
    category = request.GET.get('category')

    queryset = Transaction.objects.all()
    if category:
        queryset = queryset.filter(category=category)

    transactions = []
    for txn in queryset:
        transactions.append({
            'id': txn.id,
            'amount': str(txn.amount),
            'transaction_type': txn.transaction_type,
            'category': txn.category,
            'date': str(txn.date),
            'description': txn.description,
        })

    return JsonResponse({'transactions': transactions})


@require_http_methods(["GET"])
def get_balance(request):
    """Return total income, total expense, and net balance."""
    income = Transaction.objects.filter(
        transaction_type='income'
    ).aggregate(total=Sum('amount'))['total'] or 0

    expense = Transaction.objects.filter(
        transaction_type='expense'
    ).aggregate(total=Sum('amount'))['total'] or 0

    balance = float(income) - float(expense)

    return JsonResponse({
        'total_income': float(income),
        'total_expense': float(expense),
        'balance': balance,
    })
