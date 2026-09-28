import api from './api';

export const labelService = {
  async getLabels() {
    const res = await api.get('/labels');
    return res.data || [];
  },

  async createLabel(labelData) {
    const res = await api.post('/labels', labelData);
    return res.data;
  },

  async updateLabel(id, labelData) {
    const res = await api.put(`/labels/${id}`, labelData);
    return res.data;
  },

  async deleteLabel(id) {
    const res = await api.delete(`/labels/${id}`);
    return res.data;
  }
};
