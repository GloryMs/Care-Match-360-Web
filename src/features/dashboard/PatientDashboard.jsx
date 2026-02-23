// src/features/dashboard/PatientDashboard.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Sparkles, FileText, Bell, User,
  ArrowRight, CheckCircle2, Clock, XCircle,
  Heart, MapPin, Star, ChevronRight, Activity,
  AlertCircle, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { StatCard, SectionHeader, EmptyCard } from './StatCard';

// ─── Mock data (replace with real API calls) ──────────────────────────────────
const MOCK_MATCHES = [
  {
    id: 'm1',
    providerName: 'Sonnengarten Pflegeheim',
    providerType: 'RESIDENTIAL',
    score: 91,
    distance: '3.2 km',
    specializations: ['Dementia Care', 'Palliative'],
    available: true,
  },
  {
    id: 'm2',
    providerName: 'Mobile Care Plus',
    providerType: 'AMBULATORY',
    score: 84,
    distance: '1.8 km',
    specializations: ['Basic Nursing', 'Mobility'],
    available: true,
  },
  {
    id: 'm3',
    providerName: 'Haus am See',
    providerType: 'RESIDENTIAL',
    score: 78,
    distance: '5.1 km',
    specializations: ['Medical Treatment'],
    available: false,
  },
];

const MOCK_OFFERS = [
  {
    id: 'o1',
    providerName: 'Sonnengarten Pflegeheim',
    status: 'SENT',
    sentAt: '2026-02-20T09:00:00',
    message: 'We have availability starting March 1st and believe we are a great fit for your needs.',
  },
  {
    id: 'o2',
    providerName: 'Mobile Care Plus',
    status: 'VIEWED',
    sentAt: '2026-02-19T14:30:00',
    message: 'Our team can provide daily home visits tailored to your schedule.',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  DRAFT:    { icon: Clock,         color: '#6b7280', bg: '#f3f4f6', label: 'Draft' },
  SENT:     { icon: Bell,          color: '#4a7a8a', bg: '#f0f6f8', label: 'Received' },
  VIEWED:   { icon: Activity,      color: '#d97706', bg: '#fffbeb', label: 'Viewed' },
  ACCEPTED: { icon: CheckCircle2,  color: '#16a34a', bg: '#f0fdf4', label: 'Accepted' },
  REJECTED: { icon: XCircle,       color: '#dc2626', bg: '#fef2f2', label: 'Declined' },
  EXPIRED:  { icon: AlertCircle,   color: '#9ca3af', bg: '#f9fafb', label: 'Expired' },
};

function ScoreRing({ score }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? 'var(--primary-500)' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
}

function MatchCard({ match }) {
  const { t } = useTranslation();
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <ScoreRing score={match.score} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-main)' }}>
            {match.providerName}
          </p>
          {!match.available && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              Unavailable
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <MapPin size={11} /> {match.distance}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}
          >
            {match.providerType === 'RESIDENTIAL' ? '🏠 Residential' : '🚗 Ambulatory'}
          </span>
        </div>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          {match.specializations.map((s) => (
            <span
              key={s}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
      <Link to="/offers" className="flex-shrink-0">
        <ChevronRight size={18} style={{ color: 'var(--text-faint)' }} />
      </Link>
    </div>
  );
}

function OfferCard({ offer }) {
  const cfg = STATUS_CONFIG[offer.status] || STATUS_CONFIG.SENT;
  const Icon = cfg.icon;
  const date = new Date(offer.sentAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric',
  });
  return (
    <div
      className="p-4 rounded-xl border transition-all duration-200 hover:shadow-md"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-main)' }}>
            {offer.providerName}
          </p>
          <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
            {offer.message}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{date}</p>
        </div>
        <span
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          <Icon size={11} /> {cfg.label}
        </span>
      </div>
      <div className="flex gap-2 mt-3">
        <Link
          to="/offers"
          className="flex-1 text-center text-xs font-semibold py-1.5 rounded-lg border transition-colors hover:opacity-80"
          style={{ borderColor: 'var(--primary-300)', color: 'var(--primary-600)' }}
        >
          View Details
        </Link>
        {offer.status === 'SENT' || offer.status === 'VIEWED' ? (
          <button
            className="flex-1 text-xs font-semibold py-1.5 rounded-lg text-white transition-colors hover:opacity-90"
            style={{ background: 'var(--primary-600)' }}
          >
            Accept
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ProfileProgress({ percent }) {
  const { t } = useTranslation();
  const steps = [
    { label: 'Basic Info', done: true },
    { label: 'Care Needs', done: true },
    { label: 'Lifestyle', done: percent >= 75 },
    { label: 'Documents', done: percent >= 100 },
  ];
  return (
    <div
      className="p-5 rounded-xl border"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
          {t('dashboard.patient.profileComplete')}
        </p>
        <span className="font-bold text-sm" style={{ color: 'var(--primary-600)' }}>
          {percent}%
        </span>
      </div>
      <div className="w-full rounded-full h-2.5 mb-4" style={{ background: 'var(--border)' }}>
        <div
          className="h-2.5 rounded-full transition-all duration-700"
          style={{ width: `${percent}%`, background: 'var(--primary-500)' }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: step.done ? 'var(--primary-500)' : 'var(--border)',
              }}
            >
              {step.done && <CheckCircle2 size={10} className="text-white" />}
            </div>
            <span className="text-xs" style={{ color: step.done ? 'var(--text-main)' : 'var(--text-faint)' }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      {percent < 100 && (
        <Link
          to="/profile"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: 'var(--primary-50)', color: 'var(--primary-700)' }}
        >
          {t('dashboard.patient.completeProfile')} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PatientDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const topScore    = MOCK_MATCHES[0]?.score ?? 0;
  const pendingOffers = MOCK_OFFERS.filter(o => o.status === 'SENT' || o.status === 'VIEWED').length;
  const profilePct  = 65;

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ background: 'var(--bg-page)' }}
    >
      {/* ── Welcome header ── */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
            style={{ background: 'var(--primary-600)' }}
          >
            {user?.email?.[0]?.toUpperCase() ?? 'P'}
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{greeting}</p>
            <h1 className="font-serif font-bold text-xl md:text-2xl" style={{ color: 'var(--text-main)' }}>
              {t('dashboard.patient.title')} 👋
            </h1>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="animate-fade-in-up delay-100">
          <StatCard
            icon={Sparkles}
            label={t('dashboard.patient.matchScore')}
            value={`${topScore}%`}
            sub="Top match"
            color="primary"
            trend={+5}
          />
        </div>
        <div className="animate-fade-in-up delay-200">
          <StatCard
            icon={FileText}
            label={t('dashboard.patient.pendingOffers')}
            value={pendingOffers}
            sub="Awaiting response"
            color="blue"
          />
        </div>
        <div className="animate-fade-in-up delay-300">
          <StatCard
            icon={Bell}
            label={t('dashboard.patient.unreadNotifications')}
            value={3}
            sub="New since yesterday"
            color="amber"
          />
        </div>
        <div className="animate-fade-in-up delay-400">
          <StatCard
            icon={TrendingUp}
            label="Care Level"
            value="Pflegegrad 3"
            sub="Moderate care"
            color="purple"
          />
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left col — Matches + Offers */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Recent Matches */}
          <div className="animate-fade-in-up delay-200">
            <SectionHeader
              title={t('dashboard.patient.recentMatches')}
              action={
                <Link
                  to="/matches"
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: 'var(--primary-600)' }}
                >
                  {t('dashboard.patient.viewAll')} <ArrowRight size={13} />
                </Link>
              }
            />
            {MOCK_MATCHES.length === 0 ? (
              <EmptyCard message={t('dashboard.patient.noMatches')} />
            ) : (
              <div className="flex flex-col gap-3">
                {MOCK_MATCHES.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            )}
          </div>

          {/* Recent Offers */}
          <div className="animate-fade-in-up delay-300">
            <SectionHeader
              title={t('dashboard.patient.recentOffers')}
              action={
                <Link
                  to="/offers"
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: 'var(--primary-600)' }}
                >
                  {t('dashboard.patient.viewAll')} <ArrowRight size={13} />
                </Link>
              }
            />
            {MOCK_OFFERS.length === 0 ? (
              <EmptyCard message={t('dashboard.patient.noOffers')} />
            ) : (
              <div className="flex flex-col gap-3">
                {MOCK_OFFERS.map((o) => <OfferCard key={o.id} offer={o} />)}
              </div>
            )}
          </div>
        </div>

        {/* Right col — Profile progress + Quick actions */}
        <div className="flex flex-col gap-6">

          {/* Profile Progress */}
          <div className="animate-fade-in-up delay-200">
            <ProfileProgress percent={profilePct} />
          </div>

          {/* Quick Actions */}
          <div className="animate-fade-in-up delay-300">
            <SectionHeader title="Quick Actions" />
            <div className="flex flex-col gap-2">
              {[
                { to: '/matches',   icon: Sparkles,  label: 'View All Matches',    color: 'var(--primary-600)' },
                { to: '/offers',    icon: FileText,  label: 'Manage Offers',        color: '#4a7a8a' },
                { to: '/profile',   icon: User,      label: 'Update Profile',       color: '#7c3aed' },
                { to: '/notifications', icon: Bell,  label: 'View Notifications',   color: '#d97706' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm hover:translate-x-1"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}18` }}
                  >
                    <item.icon size={15} style={{ color: item.color }} />
                  </div>
                  <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-main)' }}>
                    {item.label}
                  </span>
                  <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
                </Link>
              ))}
            </div>
          </div>

          {/* Care tip card */}
          <div
            className="animate-fade-in-up delay-400 p-5 rounded-xl text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))' }}
          >
            <div className="absolute -top-4 -end-4 w-20 h-20 rounded-full opacity-20 bg-white" />
            <Heart size={20} className="mb-2 opacity-80" />
            <p className="font-semibold text-sm mb-1">Care Tip of the Day</p>
            <p className="text-xs opacity-80 leading-relaxed">
              Maintaining regular social interaction can significantly improve quality of life for elderly patients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}