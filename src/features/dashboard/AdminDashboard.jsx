// src/features/dashboard/AdminDashboard.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Users, Sparkles, FileText, CreditCard,
  TrendingUp, Activity, Shield, BarChart3,
  ArrowRight, ChevronRight, CheckCircle2,
  AlertCircle, Clock, UserCheck, UserX,
  HeartPulse,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { StatCard, SectionHeader } from './StatCard';

// ─── Mock analytics data ──────────────────────────────────────────────────────
const MOCK_REPORT = {
  totalUsers:         2500,
  activeUsers:        1800,
  totalMatches:       12000,
  totalOffers:        1500,
  totalSubscriptions: 320,
  eventCounts: {
    'profile.created':   500,
    'match.calculated':  1200,
    'offer.sent':        300,
    'offer.accepted':    120,
  },
  usageStatistics: {
    avgMatchScore: 78.3,
    topRegions: ['Bavaria', 'Baden-Württemberg', 'NRW'],
  },
};

const MOCK_RECENT_USERS = [
  { id: 'u1', email: 'anna.m@example.com',  role: 'PATIENT',              joinedAt: '2026-02-22T10:00:00', verified: true  },
  { id: 'u2', email: 'dr.schulz@care.de',   role: 'RESIDENTIAL_PROVIDER', joinedAt: '2026-02-21T14:30:00', verified: true  },
  { id: 'u3', email: 'peter.k@example.com', role: 'RELATIVE',             joinedAt: '2026-02-21T09:15:00', verified: false },
  { id: 'u4', email: 'ambulanz1@pflege.de', role: 'AMBULATORY_PROVIDER',  joinedAt: '2026-02-20T16:45:00', verified: true  },
  { id: 'u5', email: 'maria.w@example.com', role: 'PATIENT',              joinedAt: '2026-02-20T11:00:00', verified: true  },
];

const MOCK_SYSTEM = [
  { service: 'Identity Service',      port: 8001, status: 'UP',   latency: '42ms'  },
  { service: 'Profile Service',       port: 8002, status: 'UP',   latency: '38ms'  },
  { service: 'Match Service',         port: 8003, status: 'UP',   latency: '56ms'  },
  { service: 'Billing Service',       port: 8004, status: 'UP',   latency: '61ms'  },
  { service: 'Notification Service',  port: 8005, status: 'WARN', latency: '210ms' },
];

const ROLE_COLORS = {
  PATIENT:              { bg: '#f0fdf4', color: '#16a34a', label: 'Patient' },
  RELATIVE:             { bg: '#eff6ff', color: '#2563eb', label: 'Relative' },
  RESIDENTIAL_PROVIDER: { bg: '#fef3c7', color: '#d97706', label: 'Residential' },
  AMBULATORY_PROVIDER:  { bg: '#fdf2f8', color: '#9333ea', label: 'Ambulatory' },
  ADMIN:                { bg: '#fef2f2', color: '#dc2626', label: 'Admin' },
};

// ─── Bar chart (pure CSS/inline) ─────────────────────────────────────────────
function EventBar({ label, value, max }) {
  const pct = Math.round((value / max) * 100);
  const colors = {
    'profile.created': 'var(--primary-500)',
    'match.calculated': '#3b82f6',
    'offer.sent': '#f59e0b',
    'offer.accepted': '#10b981',
  };
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-32 flex-shrink-0 truncate" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <div className="flex-1 rounded-full h-3 overflow-hidden" style={{ background: 'var(--border)' }}>
        <div
          className="h-3 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: colors[label] || 'var(--primary-500)' }}
        />
      </div>
      <span className="text-xs font-bold w-12 text-end" style={{ color: 'var(--text-main)' }}>
        {value.toLocaleString()}
      </span>
    </div>
  );
}

// ─── Donut for user breakdown ─────────────────────────────────────────────────
function UserBreakdownDonut() {
  const segments = [
    { label: 'Patients',   pct: 52, color: '#22c55e' },
    { label: 'Relatives',  pct: 18, color: '#3b82f6' },
    { label: 'Residential',pct: 17, color: '#f59e0b' },
    { label: 'Ambulatory', pct: 13, color: '#a855f7' },
  ];
  let offset = 25; // start from top
  const r = 40;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-28 h-28 flex-shrink-0">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          {segments.map((seg) => {
            const dash = (seg.pct / 100) * circ;
            const el = (
              <circle
                key={seg.label}
                cx="50" cy="50" r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-(offset / 100) * circ + circ * 0.25}
              />
            );
            offset += seg.pct;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xl font-serif font-bold" style={{ color: 'var(--text-main)' }}>
            {(MOCK_REPORT.totalUsers / 1000).toFixed(1)}k
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>users</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span style={{ color: 'var(--text-muted)' }}>{seg.label}</span>
            <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();
  const maxEvent = Math.max(...Object.values(MOCK_REPORT.eventCounts));

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--bg-page)' }}>

      {/* ── Header ── */}
      <div className="mb-8 animate-fade-in-up flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={20} style={{ color: 'var(--primary-600)' }} />
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}
            >
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </span>
          </div>
          <h1 className="font-serif font-bold text-xl md:text-2xl" style={{ color: 'var(--text-main)' }}>
            {t('dashboard.admin.title')}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Platform overview · {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <Link
          to="/analytics"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm flex-shrink-0 transition-all hover:opacity-90"
          style={{ background: 'var(--primary-600)' }}
        >
          <BarChart3 size={16} /> Full Analytics Report
        </Link>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="animate-fade-in-up delay-100">
          <StatCard icon={Users}      label={t('dashboard.admin.totalUsers')}        value={MOCK_REPORT.totalUsers.toLocaleString()}         sub="Registered accounts"      color="primary" trend={+12} />
        </div>
        <div className="animate-fade-in-up delay-200">
          <StatCard icon={UserCheck}  label={t('dashboard.admin.activeUsers')}       value={MOCK_REPORT.activeUsers.toLocaleString()}        sub="Monthly active"           color="green"   trend={+5}  />
        </div>
        <div className="animate-fade-in-up delay-300">
          <StatCard icon={Sparkles}   label={t('dashboard.admin.totalMatches')}      value={MOCK_REPORT.totalMatches.toLocaleString()}       sub="All time"                 color="blue"    />
        </div>
        <div className="animate-fade-in-up delay-400">
          <StatCard icon={FileText}   label={t('dashboard.admin.totalOffers')}       value={MOCK_REPORT.totalOffers.toLocaleString()}        sub="Sent by providers"        color="amber"   />
        </div>
        <div className="animate-fade-in-up delay-500">
          <StatCard icon={CreditCard} label={t('dashboard.admin.totalSubscriptions')}value={MOCK_REPORT.totalSubscriptions.toLocaleString()}sub="Active subscriptions"      color="purple"  trend={+3}  />
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Event chart + Recent users */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Platform events chart */}
          <div
            className="animate-fade-in-up delay-200 p-5 rounded-xl border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <SectionHeader
              title="Platform Event Counts"
              action={
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                  All time
                </span>
              }
            />
            <div className="flex flex-col gap-4 mt-2">
              {Object.entries(MOCK_REPORT.eventCounts).map(([key, val]) => (
                <EventBar key={key} label={key} value={val} max={maxEvent} />
              ))}
            </div>
            <div className="mt-5 pt-4 border-t grid grid-cols-2 gap-3" style={{ borderColor: 'var(--border)' }}>
              <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-subtle)' }}>
                <p className="text-2xl font-serif font-bold" style={{ color: 'var(--primary-600)' }}>
                  {MOCK_REPORT.usageStatistics.avgMatchScore}%
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Avg. Match Score</p>
              </div>
              <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-subtle)' }}>
                <p className="text-2xl font-serif font-bold" style={{ color: 'var(--primary-600)' }}>
                  {Math.round((MOCK_REPORT.eventCounts['offer.accepted'] / MOCK_REPORT.eventCounts['offer.sent']) * 100)}%
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Offer Accept Rate</p>
              </div>
            </div>
          </div>

          {/* Recent users table */}
          <div className="animate-fade-in-up delay-300">
            <SectionHeader
              title={t('dashboard.admin.recentUsers')}
              action={
                <Link to="/users" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--primary-600)' }}>
                  View All <ArrowRight size={13}/>
                </Link>
              }
            />
            <div
              className="rounded-xl border overflow-hidden"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid var(--border)`, background: 'var(--bg-subtle)' }}>
                    <th className="text-start px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>User</th>
                    <th className="text-start px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Role</th>
                    <th className="text-start px-4 py-3 text-xs font-semibold hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Joined</th>
                    <th className="text-start px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_RECENT_USERS.map((u, i) => {
                    const roleStyle = ROLE_COLORS[u.role] || ROLE_COLORS.PATIENT;
                    return (
                      <tr
                        key={u.id}
                        style={{ borderBottom: i < MOCK_RECENT_USERS.length - 1 ? `1px solid var(--border)` : 'none' }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ background: 'var(--primary-500)' }}
                            >
                              {u.email[0].toUpperCase()}
                            </div>
                            <span className="text-sm truncate max-w-[140px]" style={{ color: 'var(--text-main)' }}>{u.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: roleStyle.bg, color: roleStyle.color }}
                          >
                            {roleStyle.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>
                          {new Date(u.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          {u.verified ? (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 size={12}/> Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-amber-600">
                              <Clock size={12}/> Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right col: User breakdown + System health + Actions */}
        <div className="flex flex-col gap-6">

          {/* User breakdown donut */}
          <div
            className="animate-fade-in-up delay-100 p-5 rounded-xl border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <SectionHeader title="User Breakdown" />
            <UserBreakdownDonut />
          </div>

          {/* Top regions */}
          <div
            className="animate-fade-in-up delay-200 p-5 rounded-xl border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <SectionHeader title="Top Regions" />
            <div className="flex flex-col gap-2">
              {MOCK_REPORT.usageStatistics.topRegions.map((region, i) => (
                <div key={region} className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#cd7c2f' }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm flex-1" style={{ color: 'var(--text-main)' }}>{region}</span>
                  <div className="w-16 rounded-full h-1.5" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${85 - i * 20}%`, background: 'var(--primary-500)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div
            className="animate-fade-in-up delay-300 p-5 rounded-xl border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <SectionHeader title={t('dashboard.admin.systemHealth')} />
            <div className="flex flex-col gap-2">
              {MOCK_SYSTEM.map((svc) => (
                <div key={svc.service} className="flex items-center gap-3">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: svc.status === 'UP' ? '#22c55e' : svc.status === 'WARN' ? '#f59e0b' : '#ef4444' }}
                  />
                  <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-main)' }}>{svc.service}</span>
                  <span className="text-xs font-mono" style={{ color: svc.status === 'UP' ? '#16a34a' : '#d97706' }}>
                    {svc.latency}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="mt-4 pt-3 border-t flex items-center justify-between text-xs"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              <span>Last check: just now</span>
              <span className="flex items-center gap-1 text-green-600 font-semibold">
                <CheckCircle2 size={11} /> 4 / 5 Healthy
              </span>
            </div>
          </div>

          {/* Quick Admin Actions */}
          <div className="animate-fade-in-up delay-400">
            <SectionHeader title="Admin Actions" />
            <div className="flex flex-col gap-2">
              {[
                { to: '/users',        icon: Users,     label: 'Manage Users',      color: 'var(--primary-600)' },
                { to: '/analytics',    icon: BarChart3, label: 'Analytics Report',  color: '#2563eb'             },
                { to: '/subscription', icon: CreditCard, label: 'Subscriptions',    color: '#d97706'             },
              ].map((item) => (
                <Link
                  key={item.to} to={item.to}
                  className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm hover:translate-x-1"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}18` }}>
                    <item.icon size={15} style={{ color: item.color }} />
                  </div>
                  <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-main)' }}>{item.label}</span>
                  <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}