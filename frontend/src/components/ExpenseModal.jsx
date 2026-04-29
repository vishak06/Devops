import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { expenseService } from '../services/expenseService';

const CATEGORIES = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'transport', label: 'Transportation' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'bills', label: 'Bills & Utilities' },
  { value: 'health', label: 'Health & Medical' },
  { value: 'education', label: 'Education' },
  { value: 'travel', label: 'Travel' },
  { value: 'income', label: 'Income' },
  { value: 'other', label: 'Other' },
];

const initialForm = {
  amount: '',
  category: 'other',
  date: new Date().toISOString().split('T')[0],
  description: '',
  is_income: false,
};

export default function ExpenseModal({ isOpen, onClose, onSaved, editData }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!editData;

  useEffect(() => {
    if (editData) {
      setForm({
        amount: editData.amount?.toString() || '',
        category: editData.category || 'other',
        date: editData.date || new Date().toISOString().split('T')[0],
        description: editData.description || '',
        is_income: editData.is_income || false,
      });
    } else {
      setForm(initialForm);
    }
    setErrors({});
  }, [editData, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (!form.date) errs.date = 'Select a date';
    if (!form.category) errs.category = 'Select a category';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-set is_income when category is 'income'
      if (field === 'category') {
        updated.is_income = value === 'income';
      }
      return updated;
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
      };

      if (isEdit) {
        await expenseService.update(editData.id, payload);
        toast.success('Transaction updated!');
      } else {
        await expenseService.create(payload);
        toast.success('Transaction added!');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Something went wrong';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl p-6 page-enter"
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {isEdit ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <button
              type="button"
              onClick={() => handleChange('is_income', false)}
              className="flex-1 py-3 text-sm font-semibold transition-all"
              style={{
                background: !form.is_income ? '#ef4444' : 'var(--color-bg-tertiary)',
                color: !form.is_income ? 'white' : 'var(--color-text-secondary)',
              }}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => { handleChange('is_income', true); handleChange('category', 'income'); }}
              className="flex-1 py-3 text-sm font-semibold transition-all"
              style={{
                background: form.is_income ? '#10b981' : 'var(--color-bg-tertiary)',
                color: form.is_income ? 'white' : 'var(--color-text-secondary)',
              }}
            >
              Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>₹</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="input-field pl-8"
                value={form.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
              />
            </div>
            {errors.amount && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.amount}</p>}
          </div>

          {/* Category */}
          {!form.is_income && (
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Category
              </label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {CATEGORIES.filter(c => c.value !== 'income').map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.category}</p>}
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Date
            </label>
            <input
              type="date"
              className="input-field"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
            {errors.date && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.date}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="Add a note..."
              className="input-field resize-none"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full justify-center py-3"
            style={{ opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? 'Saving...' : isEdit ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}
