import { profileApi } from './axiosInstances';

export const patientProfileAPI = {
  create: (data) => profileApi.post('/profiles/patients', data),
  getMyProfile: () => profileApi.get('/profiles/patients/me'),
  update: (id, data) => profileApi.put(`/profiles/patients/${id}`, data),
  getById: (id) => profileApi.get(`/profiles/patients/${id}`),
  uploadDocument: (id, formData) =>
    profileApi.post(`/profiles/patients/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteDocument: (profileId, docId) =>
    profileApi.delete(`/profiles/patients/${profileId}/documents/${docId}`),
};

export const providerProfileAPI = {
  create: (data) => profileApi.post('/profiles/providers', data),
  getMyProfile: () => profileApi.get('/profiles/providers/me'),
  update: (id, data) => profileApi.put(`/profiles/providers/${id}`, data),
  getById: (id) => profileApi.get(`/profiles/providers/${id}`),
  search: (params) => profileApi.get('/profiles/providers/search', { params }),
  uploadDocument: (id, formData) =>
    profileApi.post(`/profiles/providers/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};