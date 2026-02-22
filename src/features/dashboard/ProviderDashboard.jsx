// src/features/dashboard/ProviderDashboard.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Sparkles, FileText, CreditCard, Bell,
  ArrowRight, CheckCircle2, Clock, Users,
  ChevronRight, Activity, TrendingUp, MapPin,
  Send, XCircle, AlertCircle, BarChart3, Star,
  PlusCircle, Building2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { StatCard, SectionHeader, EmptyCard } from './StatCard';

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_MATCHES = [
  { id: 'm1', patientName: 'Patient #A-1042', score: 94, careLevel: 3, distance: '2.1 km', needs: ['Dementia', 'Basic Nursing'], offerSent: false },
  { id: 'm2', patientName: 'Patient #A-1038', score: 87, careLevel: 2, distance: '3.5 km', needs: ['Mobility', 'Palliative'],    offerSent: true  },
  { id: 'm3', patientName: 'Patient #A-1029', score: 81, careLevel: 4, distance: '4.2 km', needs: ['Medical Treatment'],         offerSent: false },
  { id: 'm4', patientName: 'Patient #A-1020', score: 76, careLevel: 3, distance: '5.8 km', needs: ['Basic Nursing'],             offerSent: false },
];

const MOCK_OFFERS = [
  { id: 'o1', patientRef: 'Patient #A-1038', status: 'ACCEPTED', sentAt: '2026-02-15T10:00:00', score: 87 },
  { id: 'o2', patientRef: 'Patient #A-1033', status: 'VIEWED',   sentAt: '2026-02-19T14:00:00', score: 79 },
  { id: 'o3', patientRef: 'Patient #A-1025', status: 'SENT',     sentAt: '2026-02-20T09:00:00', score: 82 },
  { id: 'o4', patientRef: 'Patient #A-1010', status: 'REJECTED', sentAt: '2026-02-17T11:00:00', score: 71 },
];

const MOCK_SUBSCRIPTION = { tier: 'PRO', status: 'ACTIVE', offersUsed: 7, offersLimit: null, renewsOn: '2026-03-22' };

const STATUS_CONFIG = {
  DRAFT:    { icon: Clock,        color: '#6b7280', bg: '#f3f4f6', label: 'Draft' },
  SENT:     { icon: Send,         color: '#2563eb', bg: '#eff6ff', label: 'Sent' },
  VIEWED:   { icon: Activity,     color: '#d97706', bg: '#fffbeb', label: 'Viewed' },
  ACCEPTED: { icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4', label: 'Accepted' },
  REJECTED: { icon: XCircle,      color: '#dc2626', bg: '#fef2f2', label: 'Rejected' },
  EXPIRED:  { icon: AlertCircle,  color: '#9ca3af', bg: '#f9fafb', label: 'Expired' },
};

const SUB_STATUS_STYLE = {
  ACTIVE:   { color: '#16a34a', bg: '#f0fdf4' },
  TRIALING: { color: '#d97706', bg: '#fffbeb' },
  PAUSED:   { color: '#6b7280', bg: '#f3f4f6' },
  PAST_DUE: { color: '#dc2626', bg: '#fef2f2' },
  CANCELLED:{ color: '#9ca3af', bg: '#f9fafb' },
};

function ScoreRing({ score }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? 'var(--primary-500)' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={`${fill} ${circ}`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
}

function OfferStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  const Icon = cfg.icon;
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

// ─── Chart bar (simple inline bar chart) ─────────────────────────────────────
function MiniBar({ label, value, max, color }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-20 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <div className="flex-1 rounded-full h-2" style={{ background: 'var(--border)' }}>
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold w-6 text-end" style={{ color: 'var(--text-main)' }}>{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProviderDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, []);

  const isResidential = user?.role === 'RESIDENTIAL_PROVIDER';
  const activeOffers   = MOCK_OFFERS.filter(o => o.status === 'SENT' || o.status === 'VIEWED').length;
  const acceptedOffers = MOCK_OFFERS.filter(o => o.status === 'ACCEPTED').length;
  const subStyle = SUB_STATUS_STYLE[MOCK_SUBSCRIPTION.status] || SUB_STATUS_STYLE.ACTIVE;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--bg-page)' }}>

      {/* ── Welcome header ── */}
      <div className="mb-8 animate-fade-in-up flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <p className="text-sm mb-0.5" style={{ color: 'var(--text-muted)' }}>{greeting}</p>
          <h1 className="font-serif font-bold text-xl md:text-2xl" style={{ color: 'var(--text-main)' }}>
            {t('dashboard.provider.title')} 🏥
          </h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}
            >
              {isResidential ? <Building2 size={12} /> : <MapPin size={12} />}
              {isResidential ? 'Residential Provider' : 'Ambulatory Provider'}
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: subStyle.bg, color: subStyle.color }}
            >
              <CreditCard size={12} /> {MOCK_SUBSCRIPTION.tier} — {MOCK_SUBSCRIPTION.status}
            </div>
          </div>
        </div>
        <Link
          to="/offers"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm flex-shrink-0 transition-all hover:opacity-90"
          style={{ background: 'var(--primary-600)' }}
        >
          <PlusCircle size={16} /> Send New Offer
        </Link>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="animate-fade-in-up delay-100">
          <StatCard icon={Sparkles}    label={t('dashboard.provider.matchedPatients')} value={MOCK_MATCHES.length} sub="High-quality matches" color="primary" trend={+8} />
        </div>
        <div className="animate-fade-in-up delay-200">
          <StatCard icon={Send}        label={t('dashboard.provider.activeOffers')}    value={activeOffers}  sub="Awaiting patient reply" color="blue" />
        </div>
        <div className="animate-fade-in-up delay-300">
          <StatCard icon={CheckCircle2} label={t('dashboard.provider.acceptedOffers')} value={acceptedOffers} sub="This month"             color="green" trend={+2} />
        </div>
        <div className="animate-fade-in-up delay-400">
          <StatCard icon={CreditCard}  label={t('dashboard.provider.subscription')}   value={MOCK_SUBSCRIPTION.tier} sub={`Renews ${MOCK_SUBSCRIPTION.renewsOn}`} color="amber" />
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left col: Matches + Offers */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Matched Patients */}
          <div className="animate-fade-in-up delay-200">
            <SectionHeader
              title="Matched Patients"
              action={
                <Link to="/matches" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--primary-600)' }}>
                  View All <ArrowRight size={13}/>
                </Link>
              }
            />
            <div className="flex flex-col gap-3">
              {MOCK_MATCHES.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                >
                  <ScoreRing score={m.score} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{m.patientName}</p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}
                      >
                        Pflegegrad {m.careLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1"><MapPin size={10}/>{m.distance}</span>
                      {m.needs.map(n => (
                        <span key={n} className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-subtle)' }}>{n}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {m.offerSent ? (
                      <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ background: '#eff6ff', color: '#2563eb' }}>
                        Offer Sent
                      </span>
                    ) : (
                      <Link
                        to="/offers"
                        className="text-xs px-3 py-1.5 rounded-lg text-white font-semibold transition-all hover:opacity-90"
                        style={{ background: 'var(--primary-600)' }}
                      >
                        Send Offer
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sent Offers */}
          <div className="animate-fade-in-up delay-300">
            <SectionHeader
              title="Recent Offers"
              action={
                <Link to="/offers" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--primary-600)' }}>
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
                    <th className="text-start px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Patient</th>
                    <th className="text-start px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Score</th>
                    <th className="text-start px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Date</th>
                    <th className="text-start px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_OFFERS.map((o, i) => (
                    <tr
                      key={o.id}
                      style={{ borderBottom: i < MOCK_OFFERS.length - 1 ? `1px solid var(--border)` : 'none' }}
                    >
                      <td className="px-4 py-3 font-medium text-sm" style={{ color: 'var(--text-main)' }}>{o.patientRef}</td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--primary-600)' }}>{o.score}%</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(o.sentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3"><OfferStatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right col: Subscription + Offer stats + Actions */}
        <div className="flex flex-col gap-6">

          {/* Subscription card */}
          <div
            className="animate-fade-in-up delay-100 p-5 rounded-xl border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
                {t('dashboard.provider.subscription')}
              </p>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: subStyle.bg, color: subStyle.color }}
              >
                {MOCK_SUBSCRIPTION.status}
              </span>
            </div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-3xl font-serif font-bold" style={{ color: 'var(--text-main)' }}>
                {MOCK_SUBSCRIPTION.tier}
              </span>
              <span className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>plan</span>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Renews on {MOCK_SUBSCRIPTION.renewsOn}
            </p>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                <span>Offers used this month</span>
                <span className="font-semibold" style={{ color: 'var(--text-main)' }}>
                  {MOCK_SUBSCRIPTION.offersUsed} / {MOCK_SUBSCRIPTION.offersLimit ?? '∞'}
                </span>
              </div>
              {MOCK_SUBSCRIPTION.offersLimit && (
                <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(MOCK_SUBSCRIPTION.offersUsed / MOCK_SUBSCRIPTION.offersLimit) * 100}%`,
                      background: 'var(--primary-500)'
                    }}
                  />
                </div>
              )}
            </div>

            <Link
              to="/subscription"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
              style={{ borderColor: 'var(--primary-300)', color: 'var(--primary-700)' }}
            >
              {t('dashboard.provider.manageSubscription')} <ArrowRight size={14}/>
            </Link>
          </div>

          {/* Offer funnel stats */}
          <div
            className="animate-fade-in-up delay-200 p-5 rounded-xl border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <SectionHeader title="Offer Funnel" />
            <div className="flex flex-col gap-3">
              <MiniBar label="Sent"     value={4}  max={10} color="#3b82f6" />
              <MiniBar label="Viewed"   value={3}  max={10} color="#f59e0b" />
              <MiniBar label="Accepted" value={1}  max={10} color="var(--primary-500)" />
              <MiniBar label="Rejected" value={1}  max={10} color="#ef4444" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="animate-fade-in-up delay-300">
            <SectionHeader title="Quick Actions" />
            <div className="flex flex-col gap-2">
              {[
                { to: '/matches',      icon: Sparkles,  label: 'Find Patients',        color: 'var(--primary-600)' },
                { to: '/offers',       icon: Send,      label: 'Manage Offers',        color: '#2563eb' },
                { to: '/subscription', icon: CreditCard, label: 'Upgrade Plan',        color: '#d97706' },
                { to: '/invoices',     icon: FileText,  label: 'View Invoices',        color: '#7c3aed' },
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