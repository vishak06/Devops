from rest_framework import serializers
from .models import Expense, Budget


class ExpenseSerializer(serializers.ModelSerializer):
    """Serializer for Expense CRUD operations."""
    category_display = serializers.CharField(
        source='get_category_display', read_only=True
    )

    class Meta:
        model = Expense
        fields = [
            'id', 'amount', 'category', 'category_display',
            'date', 'description', 'is_income',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'category_display']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def create(self, validated_data):
        # Automatically assign the logged-in user
        validated_data['user'] = self.context['request'].user
        # Auto-set is_income if category is 'income'
        if validated_data.get('category') == 'income':
            validated_data['is_income'] = True
        return super().create(validated_data)


class BudgetSerializer(serializers.ModelSerializer):
    """Serializer for Budget management."""
    category_display = serializers.CharField(
        source='get_category_display', read_only=True
    )
    spent = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = [
            'id', 'category', 'category_display', 'monthly_limit',
            'month', 'spent', 'remaining', 'percentage', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'category_display', 'spent', 'remaining', 'percentage']

    def _get_spent(self, obj):
        """Calculate total spending for this budget's category and month."""
        from django.db.models import Sum
        total = Expense.objects.filter(
            user=obj.user,
            category=obj.category,
            is_income=False,
            date__year=obj.month.year,
            date__month=obj.month.month,
        ).aggregate(total=Sum('amount'))['total']
        return total or 0

    def get_spent(self, obj):
        return float(self._get_spent(obj))

    def get_remaining(self, obj):
        spent = self._get_spent(obj)
        return float(obj.monthly_limit - spent)

    def get_percentage(self, obj):
        spent = self._get_spent(obj)
        if obj.monthly_limit > 0:
            return round(float(spent / obj.monthly_limit * 100), 1)
        return 0

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
