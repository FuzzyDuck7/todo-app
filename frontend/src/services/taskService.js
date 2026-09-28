import api from './api';

export const taskService = {
  async getTasks(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`/tasks${queryString}`);
    return {
      tasks: res.data || [],
      pagination: res.pagination || {}
    };
  },

  async getTaskById(id) {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  },

  async createTask(taskData) {
    const res = await api.post('/tasks', taskData);
    return res.data;
  },

  async updateTask(id, taskData) {
    const res = await api.put(`/tasks/${id}`, taskData);
    return res.data;
  },

  async deleteTask(id) {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  },

  async completeTask(id) {
    const res = await api.patch(`/tasks/${id}/complete`);
    return res.data;
  },

  async reopenTask(id) {
    const res = await api.patch(`/tasks/${id}/reopen`);
    return res.data;
  },

  async archiveTask(id) {
    const res = await api.patch(`/tasks/${id}/archive`);
    return res.data;
  },

  // Subtasks
  async getSubtasks(taskId) {
    const res = await api.get(`/tasks/${taskId}/subtasks`);
    return res.data;
  },

  async addSubtask(taskId, title) {
    const res = await api.post(`/tasks/${taskId}/subtasks`, { title });
    return res.data;
  },

  async updateSubtask(subtaskId, updates) {
    const res = await api.put(`/subtasks/${subtaskId}`, updates);
    return res.data;
  },

  async toggleSubtask(subtaskId) {
    const res = await api.patch(`/subtasks/${subtaskId}/complete`);
    return res.data;
  },

  async deleteSubtask(subtaskId) {
    const res = await api.delete(`/subtasks/${subtaskId}`);
    return res.data;
  }
};
