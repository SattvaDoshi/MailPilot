import api from './api'

export const groupsAPI = {
  getGroups: () => api.get('/groups'),
  getGroup: (id) => api.get(`/groups/${id}`),
  createGroup: (data) => api.post('/groups', data),
  updateGroup: (id, data) => api.put(`/groups/${id}`, data),
  deleteGroup: (id) => api.delete(`/groups/${id}`),
  addContact: (groupId, contact) => api.post(`/groups/${groupId}/contacts`, contact),
  removeContact: (groupId, contactId) => api.delete(`/groups/${groupId}/contacts/${contactId}`)
}
