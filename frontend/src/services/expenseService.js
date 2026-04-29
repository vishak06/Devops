import api from './api';

export const expenseService = {
  // Get all expenses with optional filters
  getAll: (params = {}) => api.get('/api/expenses/', { params }),

  // Get single expense
  getById: (id) => api.get(`/api/expenses/${id}/`),

  // Create new expense
  create: (data) => api.post('/api/expenses/', data),

  // Update expense
  update: (id, data) => api.put(`/api/expenses/${id}/`, data),

  // Delete expense
  delete: (id) => api.delete(`/api/expenses/${id}/`),

  // Get dashboard summary
  getDashboard: () => api.get('/api/dashboard/'),

  // Analytics
  getMonthlyAnalytics: () => api.get('/api/analytics/monthly/'),
  getCategoryAnalytics: (month) =>
    api.get('/api/analytics/category/', { params: month ? { month } : {} }),

  // Budgets
  getBudgets: (params = {}) => api.get('/api/budgets/', { params }),
  createBudget: (data) => api.post('/api/budgets/', data),
  updateBudget: (id, data) => api.put(`/api/budgets/${id}/`, data),
  deleteBudget: (id) => api.delete(`/api/budgets/${id}/`),

  // Export
  exportCSV: () => api.get('/api/export/csv/', { responseType: 'blob' }),
};
