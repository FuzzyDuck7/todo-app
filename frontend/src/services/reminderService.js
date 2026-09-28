import api from './api';

export const reminderService = {
  async getReminders() {
    const res = await api.get('/reminders');
    return res.data || [];
  },

  async createReminder(reminderData) {
    const res = await api.post('/reminders', reminderData);
    return res.data;
  },

  async updateReminder(id, updates) {
    const res = await api.put(`/reminders/${id}`, updates);
    return res.data;
  },

  async deleteReminder(id) {
    const res = await api.delete(`/reminders/${id}`);
    return res.data;
  }
};
