// src/features/notifications/NotificationsPage.jsx
// Real API — replaces mock data. Works for all roles.
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Bell, BellOff, Check, CheckCheck, Loader2,
  AlertCircle, ChevronLeft, ChevronRight,
  Mail, Smartphone, MessageSquare, RefreshCw,
} from 'lucide-react';
import { notificationAPI } from '../../api/notificationService';
import { useToast } from '../../hooks/useToast';

// ─── Type config ──────────────────────────────────────────────────────────────
const TYPE_ICON = {
  EMAIL:  Mail,
  IN_APP: MessageSquare,
  PUSH:   Smartphone,
};

// ─── Notification Card ────────────────────────────────────────────────────────
function NotifCard({ notif, onMarkRead }) {
  const Icon = TYPE_ICON[notif.type] || Bell;
  const isRead = notif.isRead || !!notif.readAt;

  return (
    <div
      className="flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-sm"
      style={{
        background:   isRead ? 'var(--bg-card)' : 'var(--primary-50)',
        borderColor:  isRead ? 'var(--border)'   : 'var(--primary-200)',
        opacity:      isRead ? 0.85 : 1,
      }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: isRead ? 'var(--bg-subtle)' : 'var(--primary-100)' }}>
        <Icon size={16} style={{ color: isRead ? 'var(--text-muted)' : 'var(--primary-600)' }} />
      </div>

      <div className="flex-1 min-w-0">
        {notif.subject && (
          <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-main)' }}>
            {notif.subject}
          </p>
        )}
        <p className="text-sm" style={{ color: 'var(--text-main)' }}>{notif.body}</p>
        <div className="flex items-center gap-3 mt-1 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
          <span>{new Date(notif.createdAt).toLocaleString()}</span>
          <span className="px-1.5 py-0.5 rounded capitalize"
            style={{ background: 'var(--bg-subtle)' }}>
            {notif.type?.toLowerCase().replace('_', '-') ?? 'notification'}
          </span>
          {notif.status && <span>{notif.status}</span>}
        </div>
      </div>

      {!isRead && (
        <button
          onClick={() => onMarkRead(notif.id)}
          className="p-1.5 rounded-lg flex-shrink-0 transition-all"
          title="Mark as read"
          style={{ background: 'var(--primary-100)' }}>
          <Check size={14} style={{ color: 'var(--primary-600)' }} />
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const profileId = useSelector(s => s.auth.profileId);
  const toast     = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [total,         setTotal]         = useState(0);
  const [filter,        setFilter]        = useState('ALL');  // ALL | UNREAD
  const [markingAll,    setMarkingAll]    = useState(false);

  const PAGE_SIZE = 20;

  const loadNotifications = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await notificationAPI.getUserNotifications(profileId, page, PAGE_SIZE);
      const data = res.data.data;
      const content = data.content ?? data;
      setNotifications(content);
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.totalElements ?? content.length);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [profileId, page]);

  const loadUnreadCount = useCallback(async () => {
    if (!profileId) return;
    try {
      const res = await notificationAPI.getUnreadCount(profileId);
      setUnreadCount(res.data.data ?? 0);
    } catch { /* ignore */ }
  }, [profileId]);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  const handleMarkRead = async (notifId) => {
    try {
      await notificationAPI.markRead(notifId);
      setNotifications(prev => prev.map(n =>
        n.id === notifId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      ));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    if (!profileId) return;
    setMarkingAll(true);
    try {
      await notificationAPI.markAllRead(profileId);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const displayed = filter === 'UNREAD'
    ? notifications.filter(n => !n.isRead && !n.readAt)
    : notifications;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-serif font-bold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm px-2.5 py-0.5 rounded-full font-semibold"
                style={{ background: 'var(--primary-600)', color: '#fff' }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {total} total notification{total !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => { loadNotifications(); loadUnreadCount(); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
            <RefreshCw size={14} />
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} disabled={markingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
              style={{ background: 'var(--primary-600)', color: '#fff' }}>
              {markingAll ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 animate-fade-in-up delay-100">
        {['ALL', 'UNREAD'].map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all"
            style={{
              background:  filter === f ? 'var(--primary-600)' : 'var(--bg-card)',
              color:       filter === f ? '#fff' : 'var(--text-muted)',
              borderColor: filter === f ? 'var(--primary-600)' : 'var(--border)',
            }}>
            {f === 'ALL' ? `All (${total})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary-500)' }} />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle size={32} style={{ color: '#dc2626' }} />
          <p style={{ color: 'var(--text-muted)' }}>{error}</p>
          <button onClick={loadNotifications}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--primary-600)', color: '#fff' }}>Retry</button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <BellOff size={48} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
          <p className="font-semibold" style={{ color: 'var(--text-main)' }}>
            {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {filter === 'UNREAD' ? "You're all caught up!" : "Notifications will appear here"}
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 animate-fade-in-up delay-200">
            {displayed.map(n => (
              <NotifCard key={n.id} notif={n} onMarkRead={handleMarkRead} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-2 rounded-xl border disabled:opacity-40"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                <ChevronLeft size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="p-2 rounded-xl border disabled:opacity-40"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}