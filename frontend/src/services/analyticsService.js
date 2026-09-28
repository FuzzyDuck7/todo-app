import api from './api';

export const analyticsService = {
  async getSummary() {
    const res = await api.get('/analytics/summary');
    return res.data;
  },

  async getCompletion(days = 14) {
    const res = await api.get(`/analytics/completion?days=${days}`);
    return res.data || [];
  },

  async getPriorities() {
    const res = await api.get('/analytics/priorities');
    return res.data || [];
  },

  async getProjects() {
    const res = await api.get('/analytics/projects');
    return res.data || [];
  },

  async getStatus() {
    const res = await api.get('/analytics/status');
    return res.data || [];
  },

  async getInsights() {
    const res = await api.get('/analytics/insights');
    return res.data || { insights: [], suggestions: [] };
  }
};
