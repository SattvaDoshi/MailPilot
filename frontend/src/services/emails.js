import api from './api'

export const emailsAPI = {
  sendEmails: (data) => api.post('/emails/send', data),
  getEmailStatus: (id) => api.get(`/emails/status/${id}`),
  getEmailHistory: (params) => api.get('/emails/history', { params }),
  getEmailAnalytics: () => api.get('/emails/analytics')
}
