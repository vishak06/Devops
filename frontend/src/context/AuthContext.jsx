import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem('tokens');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Persist tokens to localStorage
  useEffect(() => {
    if (tokens) {
      localStorage.setItem('tokens', JSON.stringify(tokens));
    } else {
      localStorage.removeItem('tokens');
    }
  }, [tokens]);

  // Fetch user profile on mount if tokens exist
  useEffect(() => {
    const fetchProfile = async () => {
      if (!tokens?.access) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/api/auth/profile/');
        setUser(res.data);
      } catch {
        // Token expired — try refresh
        try {
          const refreshRes = await api.post('/api/auth/token/refresh/', {
            refresh: tokens.refresh,
          });
          setTokens(prev => ({ ...prev, access: refreshRes.data.access }));
          const res = await api.get('/api/auth/profile/');
          setUser(res.data);
        } catch {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (username, password) => {
    const res = await api.post('/api/auth/login/', { username, password });
    setTokens(res.data.tokens);
    setUser(res.data.user);
    return res.data;
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.post('/api/auth/register/', data);
    setTokens(res.data.tokens);
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    setTokens(null);
    setUser(null);
    localStorage.removeItem('tokens');
  }, []);

  return (
    <AuthContext.Provider value={{ user, tokens, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
