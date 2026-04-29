import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { expenseService } from '../services/expenseService';
import TransactionCard from '../components/TransactionCard';
import ExpenseModal from '../components/ExpenseModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
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

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (category) params.category = category;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await expenseService.getAll(params);
      setTransactions(res.data.results || res.data);
      if (res.data.count) setTotalPages(Math.ceil(res.data.count / 20));
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, search, category, dateFrom, dateTo]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await expenseService.delete(id);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch { toast.error('Failed to delete'); }
  };

  const handleEdit = (expense) => { setEditData(expense); setModalOpen(true); };

  const handleExportCSV = async () => {
    try {
      const res = await expenseService.exportCSV();
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    } catch { toast.error('Export failed'); }
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Transactions</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>View and manage all your transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={handleExportCSV}><Download size={16} /><span className="hidden sm:inline">Export CSV</span></button>
          <button className="btn-primary" onClick={() => { setEditData(null); setModalOpen(true); }}><Plus size={16} /><span className="hidden sm:inline">Add New</span></button>
        </div>
      </div>

      <div className="card p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input type="text" className="input-field pl-10" placeholder="Search transactions..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)} style={{ background: showFilters ? 'var(--color-accent-light)' : undefined, color: showFilters ? 'var(--color-accent)' : undefined }}>
            <Filter size={16} /><span className="hidden sm:inline">Filters</span>
          </button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
            <select className="input-field" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input type="date" className="input-field" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
            <input type="date" className="input-field" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
            <button onClick={() => { setSearch(''); setCategory(''); setDateFrom(''); setDateTo(''); setPage(1); }} className="text-sm font-medium sm:col-span-3" style={{ color: 'var(--color-accent)' }}>Clear all filters</button>
          </div>
        )}
      </div>

      {loading ? <LoadingSkeleton type="list" count={8} /> : transactions.length > 0 ? (
        <div className="space-y-2">
          {transactions.map((tx, i) => <TransactionCard key={tx.id} expense={tx} onEdit={handleEdit} onDelete={handleDelete} style={{ animationDelay: `${i * 40}ms` }} />)}
        </div>
      ) : (
        <div className="card p-12 text-center"><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No transactions found.</p></div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
          <span className="text-sm font-medium px-4" style={{ color: 'var(--color-text-secondary)' }}>Page {page} of {totalPages}</span>
          <button className="btn-secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
        </div>
      )}

      <ExpenseModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} onSaved={fetchTransactions} editData={editData} />
    </div>
  );
}
