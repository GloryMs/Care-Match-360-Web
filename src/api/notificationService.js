import { notificationApi } from './axiosInstances';

export const notificationAPI = {
  getForUser: (userId, params) =>
    notificationApi.get(`/notifications/user/${userId}`, { params }),
  getUnread: (userId) =>
    notificationApi.get(`/notifications/user/${userId}/unread`),
  getUnreadCount: (userId) =>
    notificationApi.get(`/notifications/user/${userId}/unread/count`),
  markRead: (id) => notificationApi.put(`/notifications/${id}/read`),
  markAllRead: (userId) =>
    notificationApi.put(`/notifications/user/${userId}/read-all`),
};

export const analyticsAPI = {
  getReport: () => notificationApi.get('/analytics/report'),
  getEventCounts: (params) =>
    notificationApi.get('/analytics/events/counts', { params }),
  getMetrics: (metricName, days) =>
    notificationApi.get(`/analytics/metrics/${metricName}/recent`, {
      params: { days },
    }),
};