import { matchApi } from './axiosInstances';

export const matchAPI = {
  getMatchesForPatient: (patientId, params) =>
    matchApi.get(`/matches/patient/${patientId}`, { params }),
  getMatchesForProvider: (providerId, params) =>
    matchApi.get(`/matches/provider/${providerId}`, { params }),
  calculateMatch: (patientId, providerId) =>
    matchApi.post('/matches/calculate', { patientId, providerId }),
  recalculateForPatient: (patientId) =>
    matchApi.post(`/matches/recalculate/patient/${patientId}`),
};

export const offerAPI = {
  create: (data) => matchApi.post('/offers', data),
  getById: (id) => matchApi.get(`/offers/${id}`),
  getForPatient: (patientId, params) =>
    matchApi.get(`/offers/patient/${patientId}`, { params }),
  getForProvider: (providerId, params) =>
    matchApi.get(`/offers/provider/${providerId}`, { params }),
  accept: (id) => matchApi.post(`/offers/${id}/accept`),
  reject: (id, reason) => matchApi.post(`/offers/${id}/reject`, { reason }),
  markViewed: (id) => matchApi.patch(`/offers/${id}/viewed`),
};