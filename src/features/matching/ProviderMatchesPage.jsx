// src/features/matching/ProviderMatchesPage.jsx
// Real API implementation — no mock data
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, MapPin, Heart, RefreshCw, Send,
  ChevronLeft, ChevronRight, Loader2, AlertCircle,
  Star, Users, Clock, Filter, SortAsc, SortDesc,
  TrendingUp, Eye,
} from 'lucide-react';
import { matchAPI } from '../../api/matchService';
import { offerAPI  } from '../../api/matchService';
import { providerProfileAPI } from '../../api/profileService';
import { useAuth  } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const scoreColor = (s) =>
  s >= 85 ? '#16a34a' : s >= 70 ? '#4a7a8a' : s >= 55 ? '#d97706' : '#dc2626';

const scoreBg = (s) =>
  s >= 85 ? '#f0fdf4' : s >= 70 ? '#f0f6f8' : s >= 55 ? '#fffbeb' : '#fef2f2';

const scoreLabel = (s) =>
  s >= 85 ? 'Excellent' : s >= 70 ? 'Good' : s >= 55 ? 'Fair' : 'Low';

function ScoreRing({ score }) {
  const r    = 26;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="flex-shrink-0">
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
      <circle
        cx="32" cy="32" r={r} fill="none"
        stroke={scoreColor(score)} strokeWidth="5"
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="36" textAnchor="middle" fontSize="13" fontWeight="700" fill={scoreColor(score)}>
        {score}
      </text>
    </svg>
  );
}

function MatchCard({ match, onSendOffer, sendingId }) {
  const [expanded, setExpanded] = useState(false);
  const isSending = sendingId === match.id;

  const breakdown = match.scoreBreakdown || {};
  const strengths = match.explanation?.strengths || [];
  const weaknesses = match.explanation?.weaknesses || [];

  return (
    <div
      className="rounded-xl border transition-all hover:shadow-md"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        <ScoreRing score={Math.round(match.score)} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
              Patient #{match.patientId?.slice(-6)}
            </p>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: scoreBg(match.score), color: scoreColor(match.score) }}
            >
              {scoreLabel(match.score)} Match
            </span>
          </div>
          {match.explanation?.summary && (
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              {match.explanation.summary}
            </p>
          )}
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Calculated: {new Date(match.calculatedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setExpanded(e => !e)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}
          >
            <Eye size={13} className="inline mr-1" />
            Details
          </button>
          <button
            onClick={() => onSendOffer(match)}
            disabled={isSending}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-60"
            style={{ background: 'var(--primary-600)', color: '#fff' }}
          >
            {isSending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Send Offer
          </button>
        </div>
      </div>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="pt-3 grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            {Object.entries(breakdown).map(([key, val]) => (
              <div key={key} className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-subtle)' }}>
                <p className="text-xs font-medium capitalize" style={{ color: 'var(--text-muted)' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-base font-bold mt-0.5" style={{ color: 'var(--text-main)' }}>
                  {Number(val).toFixed(1)}
                </p>
              </div>
            ))}
          </div>
          {(strengths.length > 0 || weaknesses.length > 0) && (
            <div className="flex gap-4 flex-wrap">
              {strengths.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#16a34a' }}>Strengths</p>
                  <div className="flex flex-wrap gap-1">
                    {strengths.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {weaknesses.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#d97706' }}>Weaknesses</p>
                  <div className="flex flex-wrap gap-1">
                    {weaknesses.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#fffbeb', color: '#d97706' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Send Offer Modal ─────────────────────────────────────────────────────────
function SendOfferModal({ match, onClose, onSent }) {
  const toast = useToast();
  const { user } = useAuth();
  const [message, setMessage]   = useState('');
  const [avFrom,  setAvFrom]    = useState('');
  const [roomType, setRoomType] = useState('SINGLE');
  const [saving,  setSaving]    = useState(false);

  const handleSend = async () => {
    if (!message.trim()) { toast.warning('Please enter a message'); return; }
    setSaving(true);
    try {
      // 1) Create draft offer
      const payload = {
        patientId: match.patientId,
        message,
        availabilityDetails: avFrom ? { availableFrom: avFrom, roomType } : undefined,
      };
      const res = await offerAPI.create(payload);
      const offerId = res.data.data.id;
      // 2) Send immediately
      await offerAPI.send(offerId);
      toast.success('Offer sent successfully');
      onSent();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to send offer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl p-6"
        style={{ background: 'var(--bg-card)' }}
      >
        <h2 className="text-lg font-serif font-bold mb-1" style={{ color: 'var(--text-main)' }}>
          Send Care Offer
        </h2>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          Match score: <strong>{Math.round(match.score)}%</strong> · Patient #{match.patientId?.slice(-6)}
        </p>

        <label className="block mb-3">
          <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-main)' }}>
            Your Message *
          </span>
          <textarea
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Describe your care offering, available rooms, special programs..."
            className="w-full rounded-xl border px-3 py-2.5 text-sm resize-none"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-page)', color: 'var(--text-main)' }}
          />
        </label>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <label className="block">
            <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-main)' }}>Available From</span>
            <input
              type="date"
              value={avFrom}
              onChange={e => setAvFrom(e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-page)', color: 'var(--text-main)' }}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-main)' }}>Room Type</span>
            <select
              value={roomType}
              onChange={e => setRoomType(e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-page)', color: 'var(--text-main)' }}
            >
              {['SINGLE', 'DOUBLE', 'SUITE', 'DEMENTIA_UNIT', 'PALLIATIVE_WARD'].map(r => (
                <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}>
            Cancel
          </button>
          <button onClick={handleSend} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'var(--primary-600)', color: '#fff' }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            Send Offer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProviderMatchesPage() {
  const { user }  = useAuth();
  const toast     = useToast();

  const [providerId, setProviderId] = useState(null);
  const [matches,    setMatches]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [page,       setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total,      setTotal]      = useState(0);
  const [sendModal,  setSendModal]  = useState(null);   // match object
  const [recalcing,  setRecalcing]  = useState(false);
  const [minScore,   setMinScore]   = useState(0);
  const [sortDir,    setSortDir]    = useState('desc');

  const PAGE_SIZE = 10;

  // Load provider profile first to get providerId
  useEffect(() => {
    providerProfileAPI.getMyProfile()
      .then(r => setProviderId(r.data.data.id))
      .catch(() => setError('Failed to load your provider profile'));
  }, []);

  const loadMatches = useCallback(async () => {
    if (!providerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await matchAPI.getProviderMatches(providerId, page, PAGE_SIZE);
      const data = res.data.data;
      // data is PageResponse
      const content = data.content ?? data;
      setMatches(content);
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.totalElements ?? content.length);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, [providerId, page]);

  useEffect(() => { loadMatches(); }, [loadMatches]);

  const handleRecalculate = async () => {
    if (!providerId) return;
    setRecalcing(true);
    try {
      await matchAPI.recalculateForProvider(providerId);
      toast.success('Match recalculation triggered — results will update shortly');
      setTimeout(loadMatches, 2000);
    } catch {
      toast.error('Recalculation failed');
    } finally {
      setRecalcing(false);
    }
  };

  const handleOfferSent = () => {
    setSendModal(null);
    toast.success('Offer sent!');
  };

  // Client-side filter & sort
  const displayed = [...matches]
    .filter(m => m.score >= minScore)
    .sort((a, b) => sortDir === 'desc' ? b.score - a.score : a.score - b.score);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-serif font-bold" style={{ color: 'var(--text-main)' }}>
            Patient Matches
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {total} compatible patients found for your facility
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRecalculate}
            disabled={recalcing || !providerId}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all disabled:opacity-60"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-card)' }}
          >
            {recalcing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            Recalculate
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 mb-5 animate-fade-in-up delay-100">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Min Score:</label>
          <select
            value={minScore}
            onChange={e => setMinScore(Number(e.target.value))}
            className="bg-transparent text-sm font-semibold outline-none"
            style={{ color: 'var(--text-main)' }}
          >
            <option value={0}>All</option>
            <option value={70}>70+</option>
            <option value={80}>80+</option>
            <option value={90}>90+</option>
          </select>
        </div>
        <button
          onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)' }}
        >
          {sortDir === 'desc' ? <SortDesc size={14} /> : <SortAsc size={14} />}
          {sortDir === 'desc' ? 'Highest First' : 'Lowest First'}
        </button>
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
          <button onClick={loadMatches}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--primary-600)', color: '#fff' }}>
            Retry
          </button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Sparkles size={48} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
          <p className="font-semibold" style={{ color: 'var(--text-main)' }}>No matches yet</p>
          <p className="text-sm text-center max-w-sm" style={{ color: 'var(--text-muted)' }}>
            Complete your provider profile and trigger a recalculation to discover compatible patients.
          </p>
          <button onClick={handleRecalculate}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--primary-600)', color: '#fff' }}>
            Find Matches Now
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 animate-fade-in-up delay-200">
            {displayed.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                onSendOffer={(match) => setSendModal(match)}
                sendingId={null}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-xl border disabled:opacity-40 transition-all"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
              >
                <ChevronLeft size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-xl border disabled:opacity-40 transition-all"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
              >
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Send Offer Modal */}
      {sendModal && (
        <SendOfferModal
          match={sendModal}
          onClose={() => setSendModal(null)}
          onSent={handleOfferSent}
        />
      )}
    </div>
  );
}