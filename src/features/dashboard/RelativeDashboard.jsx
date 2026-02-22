// src/features/dashboard/RelativeDashboard.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Sparkles, FileText, Bell, User,
  ArrowRight, CheckCircle2, Clock, Heart,
  ChevronRight, Activity, Users, Shield,
  TrendingUp, MapPin, XCircle, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { StatCard, SectionHeader, EmptyCard } from './StatCard';

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_PATIENT = {
  name: 'Heinrich Müller',
  age: 82,
  careLevel: 3,
  location: 'Munich, Bavaria',
  profileComplete: 78,
};

const MOCK_MATCHES = [
  { id: 'm1', providerName: 'Sonnengarten Pflegeheim', score: 91, distance: '3.2 km', type: 'RESIDENTIAL', available: true },
  { id: 'm2', providerName: 'Mobile Care Plus',        score: 84, distance: '1.8 km', type: 'AMBULATORY',  available: true },
  { id: 'm3', providerName: 'Haus am See',             score: 78, distance: '5.1 km', type: 'RESIDENTIAL', available: false },
];

const MOCK_OFFERS = [
  {
    id: 'o1', providerName: 'Sonnengarten Pflegeheim',
    status: 'SENT', sentAt: '2026-02-20T09:00:00',
    message: 'We have availability starting March 1st.',
  },
  {
    id: 'o2', providerName: 'Mobile Care Plus',
    status: 'ACCEPTED', sentAt: '2026-02-18T10:00:00',
    message: 'Daily home visits scheduled to begin next week.',
  },
];

const MOCK_ACTIVITY = [
  { id: 1, text: 'New offer received from Sonnengarten',     time: '2 hours ago',   icon: FileText,    color: '#2563eb' },
  { id: 2, text: 'Match score updated for Heinrich',        time: 'Yesterday',     icon: Sparkles,    color: 'var(--primary-600)' },
  { id: 3, text: 'Profile information updated',             time: '3 days ago',    icon: User,        color: '#7c3aed' },
  { id: 4, text: 'Mobile Care Plus offer accepted',         time: '4 days ago',    icon: CheckCircle2, color: '#16a34a' },
];

const STATUS_CONFIG = {
  SENT:     { icon: Bell,          color: '#2563eb', bg: '#eff6ff',  label: 'Received' },
  VIEWED:   { icon: Activity,      color: '#d97706', bg: '#fffbeb',  label: 'Viewed' },
  ACCEPTED: { icon: CheckCircle2,  color: '#16a34a', bg: '#f0fdf4',  label: 'Accepted' },
  REJECTED: { icon: XCircle,       color: '#dc2626', bg: '#fef2f2',  label: 'Declined' },
  EXPIRED:  { icon: AlertCircle,   color: '#9ca3af', bg: '#f9fafb',  label: 'Expired' },
  DRAFT:    { icon: Clock,         color: '#6b7280', bg: '#f3f4f6',  label: 'Draft' },
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RelativeDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, []);

  const pendingOffers   = MOCK_OFFERS.filter(o => o.status === 'SENT' || o.status === 'VIEWED').length;
  const acceptedOffers  = MOCK_OFFERS.filter(o => o.status === 'ACCEPTED').length;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--bg-page)' }}>

      {/* ── Welcome header ── */}
      <div className="mb-8 animate-fade-in-up">
        <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{greeting}</p>
        <h1 className="font-serif font-bold text-xl md:text-2xl" style={{ color: 'var(--text-main)' }}>
          Care Management Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Managing care for <span className="font-semibold" style={{ color: 'var(--primary-600)' }}>
            {MOCK_PATIENT.name}
          </span>
        </p>
      </div>

      {/* ── Patient summary card ── */}
      <div
        className="animate-fade-in-up delay-100 mb-8 p-5 rounded-2xl border flex flex-col md:flex-row md:items-center gap-4"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
          style={{ background: 'var(--primary-100)' }}
        >
          👴
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="font-serif font-bold text-lg" style={{ color: 'var(--text-main)' }}>
              {MOCK_PATIENT.name}
            </h2>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}
            >
              Pflegegrad {MOCK_PATIENT.careLevel}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><User size={11}/> Age {MOCK_PATIENT.age}</span>
            <span className="flex items-center gap-1"><MapPin size={11}/> {MOCK_PATIENT.location}</span>
            <span className="flex items-center gap-1"><Shield size={11}/> Profile {MOCK_PATIENT.profileComplete}% complete</span>
          </div>
          <div className="mt-2 w-full md:max-w-xs">
            <div className="w-full rounded-full h-1.5" style={{ background: 'var(--border)' }}>
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${MOCK_PATIENT.profileComplete}%`, background: 'var(--primary-500)' }}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/profile"
            className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
            style={{ borderColor: 'var(--primary-300)', color: 'var(--primary-600)' }}
          >
            Edit Profile
          </Link>
          <Link
            to="/matches"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--primary-600)' }}
          >
            View Matches
          </Link>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="animate-fade-in-up delay-100">
          <StatCard icon={Sparkles}  label="Top Match Score" value={`${MOCK_MATCHES[0]?.score ?? 0}%`} sub="Best provider match"   color="primary" trend={+3} />
        </div>
        <div className="animate-fade-in-up delay-200">
          <StatCard icon={FileText}  label="Pending Offers"  value={pendingOffers}  sub="Need your response"   color="blue" />
        </div>
        <div className="animate-fade-in-up delay-300">
          <StatCard icon={CheckCircle2} label="Accepted Offers" value={acceptedOffers} sub="Care arranged"       color="green" />
        </div>
        <div className="animate-fade-in-up delay-400">
          <StatCard icon={Users}     label="Available Matches" value={MOCK_MATCHES.filter(m => m.available).length} sub="Providers ready"  color="purple" />
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Matches + Offers */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Matches */}
          <div className="animate-fade-in-up delay-200">
            <SectionHeader
              title="Top Matches for Heinrich"
              action={
                <Link to="/matches" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--primary-600)' }}>
                  View All <ArrowRight size={13} />
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
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{m.providerName}</p>
                      {!m.available && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Unavailable</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1"><MapPin size={10}/>{m.distance}</span>
                      <span
                        className="px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}
                      >
                        {m.type === 'RESIDENTIAL' ? '🏠 Residential' : '🚗 Ambulatory'}
                      </span>
                    </div>
                  </div>
                  <Link to="/offers"><ChevronRight size={16} style={{ color: 'var(--text-faint)' }} /></Link>
                </div>
              ))}
            </div>
          </div>

          {/* Offers */}
          <div className="animate-fade-in-up delay-300">
            <SectionHeader
              title="Recent Offers"
              action={
                <Link to="/offers" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--primary-600)' }}>
                  View All <ArrowRight size={13} />
                </Link>
              }
            />
            <div className="flex flex-col gap-3">
              {MOCK_OFFERS.map((o) => {
                const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.SENT;
                const Icon = cfg.icon;
                return (
                  <div
                    key={o.id}
                    className="p-4 rounded-xl border"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{o.providerName}</p>
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{o.message}</p>
                      </div>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        <Icon size={11}/> {cfg.label}
                      </span>
                    </div>
                    {(o.status === 'SENT' || o.status === 'VIEWED') && (
                      <div className="flex gap-2 mt-3">
                        <Link to="/offers" className="flex-1 text-center text-xs font-semibold py-1.5 rounded-lg border transition-colors"
                          style={{ borderColor: 'var(--primary-300)', color: 'var(--primary-600)' }}>
                          Review Offer
                        </Link>
                        <button className="flex-1 text-xs font-semibold py-1.5 rounded-lg text-white"
                          style={{ background: 'var(--primary-600)' }}>
                          Accept for Heinrich
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Activity + Actions */}
        <div className="flex flex-col gap-6">
          {/* Recent Activity */}
          <div className="animate-fade-in-up delay-200">
            <SectionHeader title="Recent Activity" />
            <div
              className="rounded-xl border divide-y"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', '--tw-divide-opacity': 1 }}
            >
              {MOCK_ACTIVITY.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${a.color}18` }}>
                    <a.icon size={13} style={{ color: a.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-snug" style={{ color: 'var(--text-main)' }}>{a.text}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="animate-fade-in-up delay-300">
            <SectionHeader title="Quick Actions" />
            <div className="flex flex-col gap-2">
              {[
                { to: '/matches',       icon: Sparkles,  label: 'Find More Providers',  color: 'var(--primary-600)' },
                { to: '/offers',        icon: FileText,  label: 'Manage All Offers',    color: '#2563eb' },
                { to: '/profile',       icon: User,      label: "Update Heinrich's Profile", color: '#7c3aed' },
                { to: '/notifications', icon: Bell,      label: 'Notifications',        color: '#d97706' },
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

          {/* Care tip */}
          <div
            className="animate-fade-in-up delay-400 p-5 rounded-xl text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))' }}
          >
            <div className="absolute -top-4 -end-4 w-20 h-20 rounded-full opacity-20 bg-white" />
            <Heart size={20} className="mb-2 opacity-80" />
            <p className="font-semibold text-sm mb-1">Supporting Your Loved One</p>
            <p className="text-xs opacity-80 leading-relaxed">
              Staying involved in care decisions helps elderly patients feel secure and valued.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}