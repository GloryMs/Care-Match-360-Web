import { profileApi } from './axiosInstances';

export const patientProfileAPI = {
  create:         (data)          => profileApi.post('/patients', data),
  getMyProfile:   ()              => profileApi.get('/patients/me'),
  update:         (data)          => profileApi.put('/patients', data),
  getById:        (id)            => profileApi.get(`/patients/${id}`),
  deleteProfile:  ()              => profileApi.delete('/patients'),
  getDocuments:   ()              => profileApi.get('/patients/documents'),
  uploadDocument: (formData)      => profileApi.post('/patients/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteDocument: (docId)         => profileApi.delete(`/patients/documents/${docId}`),
};

export const providerProfileAPI = {
  create:         (data)          => profileApi.post('/providers', data),
  getMyProfile:   ()              => profileApi.get('/providers/me'),
  update:         (data)          => profileApi.put('/providers', data),
  getById:        (id)            => profileApi.get(`/providers/${id}`),
  deleteProfile:  ()              => profileApi.delete('/providers'),
  search:         (data)          => profileApi.post('/providers/search', data),
  getDocuments:   ()              => profileApi.get('/providers/documents'),
  uploadDocument: (formData)      => profileApi.post('/providers/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteDocument: (docId)         => profileApi.delete(`/providers/documents/${docId}`),
};
