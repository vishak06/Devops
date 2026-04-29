import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, BarChart3, LogOut, Wallet, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen flex flex-col
          transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          width: '260px',
          background: 'var(--color-bg-secondary)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-16" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <Wallet size={18} color="white" />
            </div>
            <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              FinanceFlow
            </span>
          </div>
          <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:opacity-70" style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive ? 'nav-active' : 'nav-inactive'
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'var(--color-accent-light)' : 'transparent',
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('nav-active')) {
                  e.currentTarget.style.background = 'var(--color-bg-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('nav-active')) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition-all duration-200"
            style={{ color: 'var(--color-danger)', background: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-danger-light)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
