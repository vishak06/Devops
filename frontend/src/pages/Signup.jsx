import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', password2: '',
    first_name: '', last_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.password2) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password !== form.password2) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        const firstKey = Object.keys(errors)[0];
        const msg = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
        toast.error(msg);
      } else {
        toast.error('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-bg-primary)' }}
    >
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #10b981)' }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
        />
      </div>

      <div className="relative w-full max-w-md page-enter">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)' }}
          >
            <Wallet size={28} color="white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Create your account
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Start tracking your finances with FinanceFlow
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>First Name</label>
                <input type="text" className="input-field" placeholder="John" value={form.first_name} onChange={(e) => handleChange('first_name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Last Name</label>
                <input type="text" className="input-field" placeholder="Doe" value={form.last_name} onChange={(e) => handleChange('last_name', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Username *</label>
              <input type="text" id="signup-username" className="input-field" placeholder="johndoe" value={form.username} onChange={(e) => handleChange('username', e.target.value)} autoComplete="username" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Email *</label>
              <input type="email" id="signup-email" className="input-field" placeholder="john@example.com" value={form.email} onChange={(e) => handleChange('email', e.target.value)} autoComplete="email" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signup-password"
                  className="input-field pr-12"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: 'var(--color-text-muted)' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Confirm Password *</label>
              <input type="password" id="signup-password2" className="input-field" placeholder="Re-enter password" value={form.password2} onChange={(e) => handleChange('password2', e.target.value)} autoComplete="new-password" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base" style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--color-accent)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
