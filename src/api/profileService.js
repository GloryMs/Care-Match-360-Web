// import { profileApi } from './axiosInstances';

// export const patientProfileAPI = {
//   create:         (data)          => profileApi.post('/patients', data),
//   getMyProfile:   ()              => profileApi.get('/patients/me'),
//   update:         (data)          => profileApi.put('/patients', data),
//   getById:        (id)            => profileApi.get(`/patients/${id}`),
//   deleteProfile:  ()              => profileApi.delete('/patients'),
//   getDocuments:   ()              => profileApi.get('/patients/documents'),
//   uploadDocument: (formData)      => profileApi.post('/patients/documents', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   }),
//   deleteDocument: (docId)         => profileApi.delete(`/patients/documents/${docId}`),
// };

// export const providerProfileAPI = {
//   create:         (data)          => profileApi.post('/providers', data),
//   getMyProfile:   ()              => profileApi.get('/providers/me'),
//   update:         (data)          => profileApi.put('/providers', data),
//   getById:        (id)            => profileApi.get(`/providers/${id}`),
//   deleteProfile:  ()              => profileApi.delete('/providers'),
//   search:         (data)          => profileApi.post('/providers/search', data),
//   getDocuments:   ()              => profileApi.get('/providers/documents'),
//   uploadDocument: (formData)      => profileApi.post('/providers/documents', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   }),
//   deleteDocument: (docId)         => profileApi.delete(`/providers/documents/${docId}`),
// };
// src/api/profileService.js
import { profileApi } from './axiosInstances';

// ─────────────────────────────────────────────────────────────────────────────
// Helper — encode a storage key to Base64-URL (same algo as the backend)
// Used when calling the new FileDownloadController endpoints directly.
// ─────────────────────────────────────────────────────────────────────────────
export const encodeFileKey = (key) =>
  btoa(key).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// ─────────────────────────────────────────────────────────────────────────────
// File / Document API  (FileDownloadController — /api/v1/files/*)
// These hit the profile-service directly, with auth token injected by the
// profileApi Axios instance.
// ─────────────────────────────────────────────────────────────────────────────
export const fileAPI = {
  /**
   * Download a file as a Blob. Caller is responsible for creating an object URL.
   * @param {string} fileUrl - the full fileUrl returned in DocumentResponse
   *                           e.g. http://localhost:8082/api/v1/files/download/<encodedKey>
   */
  downloadByUrl: (fileUrl) =>
    profileApi.get(fileUrl, { responseType: 'blob', baseURL: '' }),

  /**
   * Get file metadata (content-type, original filename, download URL) without streaming.
   * @param {string} encodedKey - Base64-URL encoded storage key
   */
  getInfo: (encodedKey) => profileApi.get(`/files/info/${encodedKey}`),

  /**
   * Build a /view URL for inline preview (images, PDFs).
   * The Axios instance base URL is already set to the profile service.
   */
  buildViewUrl: (fileUrl) => fileUrl?.replace('/download/', '/view/') ?? '',
};

// ─────────────────────────────────────────────────────────────────────────────
// Patient Profile API
// ─────────────────────────────────────────────────────────────────────────────
export const patientProfileAPI = {
  create:         (data)      => profileApi.post('/patients', data),
  getMyProfile:   ()          => profileApi.get('/patients/me'),
  update:         (data)      => profileApi.put('/patients', data),
  getById:        (id)        => profileApi.get(`/patients/${id}`),
  deleteProfile:  ()          => profileApi.delete('/patients'),

  // Documents
  getDocuments:   ()          => profileApi.get('/patients/documents'),
  uploadDocument: (formData)  => profileApi.post('/patients/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteDocument: (docId)     => profileApi.delete(`/patients/documents/${docId}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Provider Profile API
// ─────────────────────────────────────────────────────────────────────────────
export const providerProfileAPI = {
  create:         (data)      => profileApi.post('/providers', data),
  getMyProfile:   ()          => profileApi.get('/providers/me'),
  update:         (data)      => profileApi.put('/providers', data),
  getById:        (id)        => profileApi.get(`/providers/${id}`),
  deleteProfile:  ()          => profileApi.delete('/providers'),
  search:         (data)      => profileApi.post('/providers/search', data),

  // Documents
  getDocuments:   ()          => profileApi.get('/providers/documents'),
  uploadDocument: (formData)  => profileApi.post('/providers/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteDocument: (docId)     => profileApi.delete(`/providers/documents/${docId}`),
};