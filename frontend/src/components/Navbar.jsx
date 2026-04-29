import { Menu, Moon, Sun, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Left — hamburger */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-xl transition-colors"
        style={{ color: 'var(--color-text-secondary)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-hover)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <Menu size={22} />
      </button>

      <div className="hidden md:block" />

      {/* Right — actions */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200"
          style={{
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-hover)';
            e.currentTarget.style.borderColor = 'var(--color-border-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-tertiary)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User avatar */}
        <div
          className="flex items-center gap-3 px-3 py-2 rounded-xl"
          style={{
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            <User size={16} color="white" />
          </div>
          <span
            className="hidden sm:inline text-sm font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {user?.first_name || user?.username || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
}
