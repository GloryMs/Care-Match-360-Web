// src/hooks/useToast.js
import toast from 'react-hot-toast';

export const useToast = () => ({
  success: (msg, opts) =>
    toast.success(msg, {
      style: { background: '#22c55e', color: '#fff', borderRadius: '12px', fontWeight: 600 },
      iconTheme: { primary: '#fff', secondary: '#22c55e' },
      ...opts,
    }),

  error: (msg, opts) =>
    toast.error(msg, {
      style: { background: '#ef4444', color: '#fff', borderRadius: '12px', fontWeight: 600 },
      iconTheme: { primary: '#fff', secondary: '#ef4444' },
      ...opts,
    }),

  info: (msg, opts) =>
    toast(msg, {
      icon: 'ℹ️',
      style: { background: '#5A8FA0', color: '#fff', borderRadius: '12px', fontWeight: 600 },
      ...opts,
    }),

  warning: (msg, opts) =>
    toast(msg, {
      icon: '⚠️',
      style: { background: '#f97316', color: '#fff', borderRadius: '12px', fontWeight: 600 },
      ...opts,
    }),
});