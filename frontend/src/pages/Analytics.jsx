import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import toast from 'react-hot-toast';
import { expenseService } from '../services/expenseService';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const PIE_COLORS = ['#f97316','#3b82f6','#a855f7','#ec4899','#eab308','#ef4444','#06b6d4','#14b8a6','#6b7280'];

export default function Analytics() {
  const [monthly, setMonthly] = useState([]);
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [mRes, cRes] = await Promise.all([
          expenseService.getMonthlyAnalytics(),
          expenseService.getCategoryAnalytics(),
        ]);
        setMonthly(mRes.data);
        setCategory(cRes.data);
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const fmt = (v) => `₹${parseFloat(v||0).toLocaleString('en-IN',{minimumFractionDigits:2})}`;

  const totalExpense = category.reduce((s,c)=>s+c.total,0);
  const avgMonthly = monthly.length ? monthly.reduce((s,m)=>s+m.expense,0)/monthly.length : 0;
  const topCategory = category[0];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl p-3 text-sm" style={{ background:'var(--color-bg-secondary)', border:'1px solid var(--color-border)', boxShadow:'var(--color-card-shadow)' }}>
        <p className="font-semibold mb-1" style={{ color:'var(--color-text-primary)' }}>{label}</p>
        {payload.map((e,i) => <p key={i} style={{ color:e.color }}>{e.name}: {fmt(e.value)}</p>)}
      </div>
    );
  };

  if (loading) return (
    <div className="space-y-6 page-enter">
      <LoadingSkeleton type="card" count={3} />
      <LoadingSkeleton type="chart" />
      <LoadingSkeleton type="chart" />
    </div>
  );

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold" style={{ color:'var(--color-text-primary)' }}>Analytics</h1>
        <p className="text-sm mt-1" style={{ color:'var(--color-text-muted)' }}>Deep insights into your spending patterns</p>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Spending" value={fmt(totalExpense)} icon={DollarSign} color="#ef4444" />
        <StatCard title="Monthly Average" value={fmt(avgMonthly)} icon={TrendingDown} color="#f59e0b" />
        <StatCard title="Top Category" value={topCategory?.category_display || 'N/A'} subtitle={topCategory ? fmt(topCategory.total) : ''} icon={Target} color="#a855f7" />
      </div>

      {/* Monthly Trend */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>Monthly Trends</h3>
        {monthly.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month_label" tick={{ fill:'var(--color-text-muted)', fontSize:12 }} />
              <YAxis tick={{ fill:'var(--color-text-muted)', fontSize:12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fill="url(#incGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64" style={{ color:'var(--color-text-muted)' }}><p className="text-sm">No data available</p></div>
        )}
      </div>

      {/* Category Breakdown + Spending Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>Category Breakdown</h3>
          {category.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={category} dataKey="total" nameKey="category_display" cx="50%" cy="50%" outerRadius={110} innerRadius={55} paddingAngle={3} stroke="none">
                  {category.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background:'var(--color-bg-secondary)', border:'1px solid var(--color-border)', borderRadius:'12px', fontSize:'13px' }} />
                <Legend wrapperStyle={{ fontSize:'12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64" style={{ color:'var(--color-text-muted)' }}><p className="text-sm">No data</p></div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>Spending Details</h3>
          <div className="space-y-3">
            {category.map((c, i) => {
              const pct = totalExpense > 0 ? (c.total / totalExpense * 100) : 0;
              return (
                <div key={c.category} className="stagger-item" style={{ animationDelay: `${i*60}ms` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color:'var(--color-text-primary)' }}>{c.category_display}</span>
                    <span className="text-sm font-semibold" style={{ color:'var(--color-text-secondary)' }}>{fmt(c.total)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background:'var(--color-bg-tertiary)' }}>
                    <div className="h-2 rounded-full transition-all duration-700" style={{ width:`${pct}%`, background: PIE_COLORS[i%PIE_COLORS.length] }} />
                  </div>
                  <p className="text-xs mt-0.5" style={{ color:'var(--color-text-muted)' }}>{pct.toFixed(1)}% · {c.count} transactions</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
