import api from "./api";

export const subscriptionsAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  createSubscription: (plan) => api.post('/subscriptions/create', { plan }),
  verifySubscription: (data) => api.post('/subscriptions/verify', data), // Add this line
  cancelSubscription: (data) => api.post('/subscriptions/cancel', data),
  changeSubscriptionPlan: (newPlan) => api.post('/subscriptions/change-plan', { newPlan }),
  getCurrentSubscription: () => api.get('/subscriptions/current'),
  getSubscriptionStatus: () => api.get('/subscriptions/status')
}
