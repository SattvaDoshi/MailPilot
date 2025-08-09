import api from './api'

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`), // Add this line
  getProfile: (token) => api.get('/users/profile', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  setupTwoFactor: () => api.post('/auth/setup-2fa'),
  verifyTwoFactor: (token) => api.post('/auth/verify-2fa', { token }),
  updateProfile: (data) => api.put('/users/profile', data),
  testSMTP: (settings) => api.post('/users/test-smtp', { smtpSettings: settings }),
  getUserStats: () => api.get('/users/stats')
}
