import { billingApi } from './axiosInstances';

export const subscriptionAPI = {
  create: (data) => billingApi.post('/subscriptions', data),
  getMySubscription: () => billingApi.get('/subscriptions/me'),
  cancel: (id) => billingApi.post(`/subscriptions/${id}/cancel`),
  pause: (id) => billingApi.post(`/subscriptions/${id}/pause`),
  resume: (id) => billingApi.post(`/subscriptions/${id}/resume`),
  upgrade: (id, tier) => billingApi.post(`/subscriptions/${id}/upgrade`, { tier }),
};

export const invoiceAPI = {
  getMyInvoices: (params) => billingApi.get('/invoices/me', { params }),
  getById: (id) => billingApi.get(`/invoices/${id}`),
  downloadPDF: (id) =>
    billingApi.get(`/invoices/${id}/download`, { responseType: 'blob' }),
};