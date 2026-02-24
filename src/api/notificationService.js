// src/api/notificationService.js
// Care Notification Service — Port 8005
import axios from 'axios';
import {store } from '../app/store';

const BASE = import.meta.env.VITE_NOTIFICATION_API_URL || 'http://localhost:8005/api/v1';

const instance = axios.create({ baseURL: BASE });

instance.interceptors.request.use((config) => {
  const state = store.getState();
  const token  = state.auth?.accessToken;
  const userId = state.auth?.user?.id;
  if (token)  config.headers['Authorization'] = `Bearer ${token}`;
  if (userId) config.headers['X-User-Id']     = userId;
  return config;
});

// ─── Notification API ─────────────────────────────────────────────────────────
export const notificationAPI = {
  // ── Notifications ──────────────────────────────────────────────────────────
  /** Send a notification */
  send: (payload) =>
    instance.post('/notifications', payload),

  /** Get all notifications for a user (paginated) */
  getUserNotifications: (userId, page = 0, size = 20) =>
    instance.get(`/notifications/user/${userId}`, { params: { page, size } }),

  /** Get unread notifications for a user */
  getUnreadNotifications: (userId) =>
    instance.get(`/notifications/user/${userId}/unread`),

  /** Get unread count for a user */
  getUnreadCount: (userId) =>
    instance.get(`/notifications/user/${userId}/unread/count`),

  /** Mark a notification as read */
  markRead: (notificationId) =>
    instance.put(`/notifications/${notificationId}/read`),

  /** Mark ALL notifications for a user as read */
  markAllRead: (userId) =>
    instance.put(`/notifications/user/${userId}/read-all`),

  // ── Analytics ──────────────────────────────────────────────────────────────
  /** Get event logs for a user (paginated) */
  getUserEvents: (userId, page = 0, size = 20) =>
    instance.get(`/analytics/events/user/${userId}`, { params: { page, size } }),

  /** Get event logs by type */
  getEventsByType: (eventType) =>
    instance.get(`/analytics/events/type/${eventType}`),

  /** Get events in a time range */
  getEventsInRange: (start, end) =>
    instance.get('/analytics/events/time-range', { params: { start, end } }),

  /** Get event counts grouped by type in a time range */
  getEventCounts: (start, end) =>
    instance.get('/analytics/events/counts', { params: { start, end } }),

  /** Get usage metrics */
  getMetrics: (metricName) =>
    instance.get(`/analytics/metrics/${metricName}`),

  /** Get recent metrics */
  getRecentMetrics: (metricName, days = 30) =>
    instance.get(`/analytics/metrics/${metricName}/recent`, { params: { days } }),

  /** Get full analytics report */
  getReport: () =>
    instance.get('/analytics/report'),
};