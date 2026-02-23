import { identityApi } from './axiosInstances';

export const authAPI = {
  register:           (data)          => identityApi.post('/auth/register', data),
  login:              (data)          => identityApi.post('/auth/login', data),
  logout:             ()              => identityApi.post('/auth/logout'),
  refreshToken:       (refreshToken)  => identityApi.post('/auth/refresh-token', { refreshToken }),
  verifyEmail:        (token)         => identityApi.post('/auth/verify-email', { token }),
  resendVerification: (email)         => identityApi.post('/auth/resend-verification', { email }),
  forgotPassword:     (email)         => identityApi.post('/auth/forgot-password', { email }),
  resetPassword:      (data)          => identityApi.post('/auth/reset-password', data),
  changePassword:     (data)          => identityApi.post('/auth/change-password', data),
};

export const userAPI = {
  getMe:       ()         => identityApi.get('/users/me'),
  getUserById: (id)       => identityApi.get(`/users/${id}`),
  getByEmail:  (email)    => identityApi.get(`/users/email/${email}`),
  deactivate:  (id)       => identityApi.put(`/users/${id}/deactivate`),
  activate:    (id)       => identityApi.put(`/users/${id}/activate`),
};

export const twoFactorAPI = {
  setup:   ()     => identityApi.post('/auth/2fa/setup'),
  enable:  (code) => identityApi.post('/auth/2fa/enable', { code }),
  disable: (code) => identityApi.post('/auth/2fa/disable', { code }),
  status:  ()     => identityApi.get('/auth/2fa/status'),
};
