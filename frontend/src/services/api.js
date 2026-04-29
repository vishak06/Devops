import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const tokensRaw = localStorage.getItem('tokens');
    if (tokensRaw) {
      const tokens = JSON.parse(tokensRaw);
      if (tokens.access) {
        config.headers.Authorization = `Bearer ${tokens.access}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokensRaw = localStorage.getItem('tokens');
        if (!tokensRaw) throw new Error('No tokens');

        const tokens = JSON.parse(tokensRaw);
        const res = await axios.post('/api/auth/token/refresh/', {
          refresh: tokens.refresh,
        });

        const newTokens = { ...tokens, access: res.data.access };
        localStorage.setItem('tokens', JSON.stringify(newTokens));
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;

        return api(originalRequest);
      } catch {
        localStorage.removeItem('tokens');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
