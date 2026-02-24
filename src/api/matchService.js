// src/api/matchService.js
// Care Match Service — Port 8003
import axios from 'axios';
import {store } from '../app/store';

const BASE = import.meta.env.VITE_MATCH_API_URL || 'http://localhost:8003/api/v1';

const instance = axios.create({ baseURL: BASE });

instance.interceptors.request.use((config) => {
  const state = store.getState();
  const token  = state.auth?.accessToken;
  const userId = state.auth?.user?.id;
  if (token)  config.headers['Authorization'] = `Bearer ${token}`;
  if (userId) config.headers['X-User-Id']     = userId;
  return config;
});

// ─── Match API ────────────────────────────────────────────────────────────────
export const matchAPI = {
  /** Calculate a single patient↔provider match */
  calculate: (patientId, providerId) =>
    instance.post('/matches/calculate', null, { params: { patientId, providerId } }),

  /** All matches for a patient (paginated) */
  getPatientMatches: (patientId, page = 0, size = 20) =>
    instance.get(`/matches/patient/${patientId}`, { params: { page, size } }),

  /** All matches for a provider (paginated) */
  getProviderMatches: (providerId, page = 0, size = 20) =>
    instance.get(`/matches/provider/${providerId}`, { params: { page, size } }),

  /** Top-N best matches for a patient */
  getTopMatches: (patientId, limit = 10) =>
    instance.get(`/matches/patient/${patientId}/top`, { params: { limit } }),

  /** Specific patient↔provider match */
  getMatch: (patientId, providerId) =>
    instance.get(`/matches/patient/${patientId}/provider/${providerId}`),

  /** Recalculate all matches for a patient */
  recalculateForPatient: (patientId) =>
    instance.post(`/matches/recalculate/patient/${patientId}`),

  /** Recalculate all matches for a provider */
  recalculateForProvider: (providerId) =>
    instance.post(`/matches/recalculate/provider/${providerId}`),
};

// ─── Offer API ────────────────────────────────────────────────────────────────
export const offerAPI = {
  /** Create a draft offer */
  create: (payload) =>
    instance.post('/offers', payload),

  /** Send a draft offer to the patient */
  send: (offerId) =>
    instance.put(`/offers/${offerId}/send`),

  /** Patient accepts an offer */
  accept: (offerId) =>
    instance.put(`/offers/${offerId}/accept`),

  /** Patient rejects an offer */
  reject: (offerId) =>
    instance.put(`/offers/${offerId}/reject`),

  /** Get a single offer */
  get: (offerId) =>
    instance.get(`/offers/${offerId}`),

  /** All offers for a patient (paginated) */
  getPatientOffers: (patientId, page = 0, size = 20) =>
    instance.get(`/offers/patient/${patientId}`, { params: { page, size } }),

  /** All offers sent by a provider (paginated) */
  getProviderOffers: (providerId, page = 0, size = 20) =>
    instance.get(`/offers/provider/${providerId}`, { params: { page, size } }),

  /** Full status history of an offer */
  getHistory: (offerId) =>
    instance.get(`/offers/${offerId}/history`),
};