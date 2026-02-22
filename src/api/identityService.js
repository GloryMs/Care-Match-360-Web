import { identityApi } from './axiosInstances';

export const authAPI = {
  register: (data) => identityApi.post('/auth/register', data),
  login: (data) => identityApi.post('/auth/login', data),
  logout: () => identityApi.post('/auth/logout'),
  refreshToken: (refreshToken) =>
    identityApi.post('/auth/refresh-token', { refreshToken }),
  verifyEmail: (token) => identityApi.post('/auth/verify-email', { token }),
  resendVerification: (email) =>
    identityApi.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => identityApi.post('/auth/forgot-password', { email }),
  resetPassword: (data) => identityApi.post('/auth/reset-password', data),
  changePassword: (data) => identityApi.post('/auth/change-password', data),
};

export const userAPI = {
  getMe: () => identityApi.get('/users/me'),
  updateMe: (data) => identityApi.put('/users/me', data),
  deleteMe: () => identityApi.delete('/users/me'),
  // Admin
  getAllUsers: (params) => identityApi.get('/users', { params }),
  getUserById: (id) => identityApi.get(`/users/${id}`),
  updateUser: (id, data) => identityApi.put(`/users/${id}`, data),
  toggleStatus: (id) => identityApi.patch(`/users/${id}/status`),
};

export const twoFactorAPI = {
  setup: () => identityApi.post('/2fa/setup'),
  verify: (code) => identityApi.post('/2fa/verify', { code }),
  disable: (code) => identityApi.post('/2fa/disable', { code }),
};