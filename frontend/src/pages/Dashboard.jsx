import { useState, useEffect, useCallback } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpDown, Plus, AlertTriangle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import toast from 'react-hot-toast';
import { expenseService } from '../services/expenseService';
import StatCard from '../components/StatCard';
import TransactionCard from '../components/TransactionCard';
import ExpenseModal from '../components/ExpenseModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

const PIE_COLORS = [
  '#f97316', '#3b82f6', '#a855f7', '#ec4899', '#eab308',
  '#ef4444', '#06b6d4', '#14b8a6', '#6b7280',
];

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [dashRes, monthRes, catRes] = await Promise.all([
        expenseService.getDashboard(),
        expenseService.getMonthlyAnalytics(),
        expenseService.getCategoryAnalytics(),
      ]);
      setDashboard(dashRes.data);
      setMonthlyData(monthRes.data);
      setCategoryData(catRes.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatCurrency = (val) =>
    `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="space-y-6 page-enter">
        <LoadingSkeleton type="card" count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton type="chart" />
          <LoadingSkeleton type="chart" />
        </div>
        <LoadingSkeleton type="list" count={5} />
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl p-3 text-sm" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', boxShadow: 'var(--color-card-shadow)' }}>
          <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
          {payload.map((entry, i) => (
            <p key={i} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Your financial overview</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} />
          <span className="hidden sm:inline">Add Transaction</span>
        </button>
      </div>

      {/* Budget Alerts */}
      {dashboard?.budget_alerts?.length > 0 && (
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'var(--color-warning-light)', border: '1px solid var(--color-warning)' }}>
          <AlertTriangle size={20} style={{ color: 'var(--color-warning)', marginTop: '2px' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-warning)' }}>Budget Alert</p>
            {dashboard.budget_alerts.map((a, i) => (
              <p key={i} className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                <strong>{a.category_display}</strong>: Spent {formatCurrency(a.spent)} of {formatCurrency(a.limit)} (over by {formatCurrency(a.over_by)})
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={formatCurrency(dashboard?.balance)}
          icon={Wallet}
          color="#10b981"
        />
        <StatCard
          title="This Month Income"
          value={formatCurrency(dashboard?.month_income)}
          icon={TrendingUp}
          color="#3b82f6"
          trend="up"
        />
        <StatCard
          title="This Month Expenses"
          value={formatCurrency(dashboard?.month_expense)}
          icon={TrendingDown}
          color="#ef4444"
          trend="down"
        />
        <StatCard
          title="Net This Month"
          value={formatCurrency((dashboard?.month_income || 0) - (dashboard?.month_expense || 0))}
          icon={ArrowUpDown}
          color="#a855f7"
          subtitle={
            (dashboard?.month_income || 0) >= (dashboard?.month_expense || 0)
              ? 'You\'re saving money!'
              : 'Spending exceeds income'
          }
          trend={(dashboard?.month_income || 0) >= (dashboard?.month_expense || 0) ? 'up' : 'down'}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bar Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Monthly Income vs Expenses
          </h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month_label" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64" style={{ color: 'var(--color-text-muted)' }}>
              <p className="text-sm">No data yet. Add your first transaction!</p>
            </div>
          )}
        </div>

        {/* Category Pie Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Spending by Category
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="total"
                  nameKey="category_display"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={3}
                  stroke="none"
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '13px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64" style={{ color: 'var(--color-text-muted)' }}>
              <p className="text-sm">No expense data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Recent Transactions
        </h3>
        {dashboard?.recent_transactions?.length > 0 ? (
          <div className="space-y-2">
            {dashboard.recent_transactions.map((tx, i) => (
              <TransactionCard
                key={tx.id}
                expense={tx}
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No transactions yet. Click "Add Transaction" to get started!
            </p>
          </div>
        )}
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchData}
      />
    </div>
  );
}
