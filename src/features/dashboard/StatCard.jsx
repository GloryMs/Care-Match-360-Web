// src/features/dashboard/StatCard.jsx
import { cn } from '../../utils/cn';

export function StatCard({ icon: Icon, label, value, sub, color = 'primary', trend }) {
  const colorMap = {
    primary: { bg: 'var(--primary-100)', icon: 'var(--primary-600)' },
    green:   { bg: '#dcfce7', icon: '#16a34a' },
    blue:    { bg: '#dbeafe', icon: '#2563eb' },
    amber:   { bg: '#fef3c7', icon: '#d97706' },
    red:     { bg: '#fee2e2', icon: '#dc2626' },
    purple:  { bg: '#ede9fe', icon: '#7c3aed' },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <div className="card flex items-start gap-4 hover:shadow-md transition-all duration-200">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: c.bg }}
      >
        <Icon size={22} style={{ color: c.icon }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide truncate" style={{ color: 'var(--text-faint)' }}>
          {label}
        </p>
        <p className="text-2xl font-serif font-bold mt-0.5" style={{ color: 'var(--text-main)' }}>
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
        )}
      </div>
      {trend !== undefined && (
        <span
          className={cn(
            'text-xs font-bold px-1.5 py-0.5 rounded-full',
            trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          )}
        >
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
}

export function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-serif font-bold" style={{ color: 'var(--text-main)' }}>{title}</h2>
      {action}
    </div>
  );
}

export function EmptyCard({ message }) {
  return (
    <div
      className="rounded-xl border border-dashed py-10 flex items-center justify-center text-sm"
      style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
    >
      {message}
    </div>
  );
}