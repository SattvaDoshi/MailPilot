// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await window.Clerk?.session?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.Clerk?.signOut();
    }
    return Promise.reject(error);
  }
);

// API methods
export const groupsAPI = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
};

export const templatesAPI = {
  getAll: (groupId) => api.get('/templates', { params: { groupId } }),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
  generateAI: (data) => api.post('/templates/generate-ai', data),
  preview: (id, data) => api.post(`/templates/${id}/preview`, data),
};

export const emailsAPI = {
  send: (data) => api.post('/emails/send', data),
  getCampaign: (campaignId) => api.get(`/emails/campaign/${campaignId}`),
  getHistory: (params) => api.get('/emails/history', { params }),
};

export const subscriptionAPI = {
  getStatus: () => api.get('/subscriptions/status'),
  getPlans: () => api.get('/subscriptions/plans'),
  create: (data) => api.post('/subscriptions/create', data),
  verify: (data) => api.post('/subscriptions/verify', data),
  cancel: () => api.post('/subscriptions/cancel'),
};

export default api;
