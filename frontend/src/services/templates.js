import api from './api'

export const templatesAPI = {
  getTemplates: (groupId) => api.get('/templates', { params: { groupId } }),
  getTemplate: (id) => api.get(`/templates/${id}`),
  createTemplate: (data) => api.post('/templates', data),
  updateTemplate: (id, data) => api.put(`/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/templates/${id}`),
  generateAITemplate: (data) => api.post('/templates/generate-ai', data)
}
