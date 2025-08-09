import api from './api'

export const subscriptionsAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  createSubscription: (plan) => api.post('/subscriptions/create', { plan }),
  verifyPayment: (data) => api.post('/subscriptions/verify', data),
  getCurrentSubscription: () => api.get('/subscriptions/current')
}
