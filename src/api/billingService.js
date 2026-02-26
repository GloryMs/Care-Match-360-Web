// src/api/billingService.js
// Care Billing Service — Port 8004
import axios from 'axios';
import {store } from '../app/store';

const BASE = import.meta.env.VITE_BILLING_API_URL || 'http://localhost:8004/api/v1';

const instance = axios.create({ baseURL: BASE });

instance.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth?.accessToken;
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// ─── Billing API ──────────────────────────────────────────────────────────────
export const billingAPI = {
  // ── Subscriptions ──────────────────────────────────────────────────────────
  /** Create a new subscription (starts 14-day trial) */
  createSubscription: (payload) =>
    instance.post('/subscriptions', payload),

  /** Upgrade or downgrade an existing subscription */
  updateSubscription: (subscriptionId, payload) =>
    instance.put(`/subscriptions/${subscriptionId}`, payload),

  /** Cancel a subscription */
  cancelSubscription: (subscriptionId) =>
    instance.delete(`/subscriptions/${subscriptionId}`),

  /** Get subscription by ID */
  getSubscription: (subscriptionId) =>
    instance.get(`/subscriptions/${subscriptionId}`),

  /** Get active subscription for a provider */
  getProviderSubscription: (providerId) =>
    instance.get(`/subscriptions/provider/${providerId}`),

  // ── Invoices ───────────────────────────────────────────────────────────────
  /** Get invoice by ID */
  getInvoice: (invoiceId) =>
    instance.get(`/invoices/${invoiceId}`),

  /** Get invoice by invoice number */
  getInvoiceByNumber: (invoiceNumber) =>
    instance.get(`/invoices/number/${invoiceNumber}`),

  /** Get all invoices for a subscription (paginated) */
  getSubscriptionInvoices: (subscriptionId, page = 0, size = 20) =>
    instance.get(`/invoices/subscription/${subscriptionId}`, { params: { page, size } }),

  /** Download invoice PDF — returns binary stream */
  downloadInvoicePdf: (invoiceId) =>
    instance.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' }),
};