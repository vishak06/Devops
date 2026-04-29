import {
  Utensils, Car, Film, ShoppingBag, Zap,
  Heart, GraduationCap, Plane, CircleDollarSign, HelpCircle,
  Edit2, Trash2
} from 'lucide-react';

const CATEGORY_CONFIG = {
  food:          { icon: Utensils,          color: '#f97316', bg: '#fff7ed' },
  transport:     { icon: Car,               color: '#3b82f6', bg: '#eff6ff' },
  entertainment: { icon: Film,              color: '#a855f7', bg: '#faf5ff' },
  shopping:      { icon: ShoppingBag,       color: '#ec4899', bg: '#fdf2f8' },
  bills:         { icon: Zap,               color: '#eab308', bg: '#fefce8' },
  health:        { icon: Heart,             color: '#ef4444', bg: '#fef2f2' },
  education:     { icon: GraduationCap,     color: '#06b6d4', bg: '#ecfeff' },
  travel:        { icon: Plane,             color: '#14b8a6', bg: '#f0fdfa' },
  income:        { icon: CircleDollarSign,  color: '#10b981', bg: '#ecfdf5' },
  other:         { icon: HelpCircle,        color: '#6b7280', bg: '#f9fafb' },
};

export default function TransactionCard({ expense, onEdit, onDelete, style = {} }) {
  const config = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.other;
  const Icon = config.icon;

  return (
    <div
      className="card flex items-center gap-4 p-4 group transition-all duration-200"
      style={{
        ...style,
        cursor: 'default',
      }}
    >
      {/* Category icon */}
      <div
        className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{ background: config.bg, color: config.color }}
      >
        <Icon size={20} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
          {expense.description || expense.category_display}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {expense.category_display} · {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* Amount */}
      <p
        className="text-sm font-bold whitespace-nowrap"
        style={{ color: expense.is_income ? '#10b981' : '#ef4444' }}
      >
        {expense.is_income ? '+' : '-'}₹{parseFloat(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={() => onEdit(expense)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(expense.id)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-danger)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-danger-light)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export { CATEGORY_CONFIG };
