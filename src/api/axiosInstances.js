import axios from 'axios';
import { store } from '../app/store';
import { logout, refreshAccessToken } from '../features/auth/authSlice';

const createInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });

  // Attach token to every request
  instance.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken;
    const userId = store.getState().auth.user?.id;

    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (userId) config.headers['X-User-Id'] = userId;

    return config;
  });

  // Handle 401 — attempt refresh, then logout
  instance.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        try {
          await store.dispatch(refreshAccessToken());
          const newToken = store.getState().auth.accessToken;
          original.headers.Authorization = `Bearer ${newToken}`;
          return instance(original);
        } catch {
          store.dispatch(logout());
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const identityApi   = createInstance(import.meta.env.VITE_IDENTITY_API_URL);
export const profileApi    = createInstance(import.meta.env.VITE_PROFILE_API_URL);
export const matchApi      = createInstance(import.meta.env.VITE_MATCH_API_URL);
export const billingApi    = createInstance(import.meta.env.VITE_BILLING_API_URL);
export const notificationApi = createInstance(import.meta.env.VITE_NOTIFICATION_API_URL);