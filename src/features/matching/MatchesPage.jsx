// src/features/matching/MatchesPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles, Search, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, Send,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { matchAPI, offerAPI }    from '../../api/matchService';
import { patientProfileAPI, providerProfileAPI } from '../../api/profileService';
import { setProfileId as setReduxProfileId } from '../../features/auth/authSlice';
import { useAuth }  from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast'; // used inside SendOfferModal

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 22; const circ = 2 * Math.PI * r; const fill = (score / 100) * circ;
  const color = score >= 80 ? 'var(--primary-500)' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={`${fill} ${circ}`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{ color }}>{Math.round(score)}%</span>
      </div>
    </div>
  );
}

// ─── Send Offer Modal (provider only) ─────────────────────────────────────────
function SendOfferModal({ patientId, onClose, onSent }) {
  const toast = useToast();
  const [message,  setMessage]  = useState('');
  const [avFrom,   setAvFrom]   = useState('');
  const [roomType, setRoomType] = useState('SINGLE');
  const [sendNow,  setSendNow]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) { toast.warning('Enter a message'); return; }
    setSaving(true);
    try {
      const payload = {
        patientId,
        message,
        availabilityDetails: avFrom ? { availableFrom: avFrom, roomType } : undefined,
      };
      const res     = await offerAPI.create(payload);
      const offerId = res.data.data.id;
      if (sendNow) {
        await offerAPI.send(offerId);
        toast.success('Offer sent to patient');
      } else {
        toast.success('Offer saved as draft');
      }
      onSent();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create offer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl p-6" style={{ background: 'var(--bg-card)' }}>
        <h2 className="text-lg font-serif font-bold mb-1" style={{ color: 'var(--text-main)' }}>
          Send Offer
        </h2>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          Patient ID: <span className="font-mono">{patientId}</span>
        </p>

        <label className="block mb-3">
          <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-main)' }}>Message *</span>
          <textarea rows={4} value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Describe your care offering..."
            className="w-full rounded-xl border px-3 py-2.5 text-sm resize-none"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-page)', color: 'var(--text-main)' }} />
        </label>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <label className="block">
            <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-main)' }}>Available From</span>
            <input type="date" value={avFrom} onChange={e => setAvFrom(e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-page)', color: 'var(--text-main)' }} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-main)' }}>Room Type</span>
            <select value={roomType} onChange={e => setRoomType(e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-page)', color: 'var(--text-main)' }}>
              {['SINGLE', 'DOUBLE', 'SUITE', 'DEMENTIA_UNIT', 'PALLIATIVE_WARD'].map(r => (
                <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input type="checkbox" checked={sendNow} onChange={e => setSendNow(e.target.checked)}
            style={{ accentColor: 'var(--primary-600)' }} />
          <span className="text-sm" style={{ color: 'var(--text-main)' }}>Send immediately (skip draft)</span>
        </label>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'var(--primary-600)', color: '#fff' }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {sendNow ? 'Create & Send' : 'Save Draft'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Match card ───────────────────────────────────────────────────────────────
function MatchCard({ match, isProvider, onSendOffer }) {
  const label = isProvider
    ? `Patient #${match.patientId?.slice(-8)}`
    : (match.providerName || `Provider #${match.providerId?.slice(-8)}`);

  const typeLabel = match.providerType
    ? (match.providerType === 'RESIDENTIAL' ? '🏠 Residential' : '🚗 Ambulatory')
    : null;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md animate-fade-in-up"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <ScoreRing score={match.score} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold" style={{ color: 'var(--text-main)' }}>{label}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap text-xs" style={{ color: 'var(--text-muted)' }}>
          {match.providerAddress && <span>{match.providerAddress}</span>}
          {typeLabel && (
            <span className="px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}>
              {typeLabel}
            </span>
          )}
          <span>Calculated {new Date(match.calculatedAt).toLocaleDateString()}</span>
        </div>
        {match.explanation?.strengths?.length > 0 && (
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            {match.explanation.strengths.map(s => (
              <span key={s} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      {isProvider && (
        <button onClick={() => onSendOffer(match.patientId)}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 flex-shrink-0 flex items-center gap-1.5"
          style={{ background: 'var(--primary-600)' }}>
          <Send size={13} />
          Send Offer
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MatchesPage() {
  const { t }          = useTranslation();
  const { isProvider } = useAuth();
  const dispatch       = useDispatch();

  const [profileId,  setProfileId]  = useState(null);
  const [matches,    setMatches]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [page,       setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search,     setSearch]     = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [offerTarget,setOfferTarget]= useState(null); // patientId when modal is open

  const PAGE_SIZE = 20;

  // Resolve own profile ID (provider profile ID or patient profile ID)
  // Also dispatches to Redux so the matchService interceptor can attach
  // the correct X-Provider-Id / X-Patient-Id header on offer API calls.
  useEffect(() => {
    const api = isProvider ? providerProfileAPI : patientProfileAPI;
    api.getMyProfile()
      .then(r => {
        const id = r.data.data.id;
        setProfileId(id);
        dispatch(setReduxProfileId(id));
      })
      .catch(() => {
        setError('Profile not found. Please complete your profile first.');
        setLoading(false);
      });
  }, [isProvider, dispatch]);

  const loadMatches = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    setError(null);
    try {
      const res = isProvider
        ? await matchAPI.getProviderMatches(profileId, page, PAGE_SIZE)
        : await matchAPI.getPatientMatches(profileId, page, PAGE_SIZE);
      const data    = res.data.data;
      const content = data.content ?? data;
      setMatches(Array.isArray(content) ? content : []);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, [profileId, isProvider, page]);

  useEffect(() => { loadMatches(); }, [loadMatches]);

  // Client-side search & type filter
  const displayed = matches.filter(m => {
    const name        = isProvider ? (m.patientId ?? '') : (m.providerName ?? '');
    const matchSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchType   = isProvider || filterType === 'ALL' || m.providerType === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--bg-page)' }}>
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-serif font-bold text-2xl" style={{ color: 'var(--text-main)' }}>
          {t('nav.matches')}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {isProvider ? 'Patients matched to your profile' : 'Care providers matched to your needs'}
        </p>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in-up delay-100">
        <div className="flex-1 relative">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('common.search')} className="form-input ps-9" />
        </div>
        {!isProvider && ['ALL', 'RESIDENTIAL', 'AMBULATORY'].map(f => (
          <button key={f} onClick={() => setFilterType(f)}
            className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
            style={{
              background:  filterType === f ? 'var(--primary-600)' : 'var(--bg-card)',
              color:       filterType === f ? '#fff' : 'var(--text-muted)',
              borderColor: filterType === f ? 'var(--primary-600)' : 'var(--border)',
            }}>
            {f === 'ALL' ? 'All' : f === 'RESIDENTIAL' ? '🏠 Residential' : '🚗 Ambulatory'}
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
          <button onClick={loadMatches}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--primary-600)', color: '#fff' }}>
            Retry
          </button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed"
          style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}>
          <Sparkles size={32} className="mx-auto mb-3 opacity-40" />
          <p>No matches found</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {displayed.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                isProvider={isProvider}
                onSendOffer={patientId => setOfferTarget(patientId)}
              />
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

      {/* Send Offer modal — provider only, patientId from match card */}
      {offerTarget && (
        <SendOfferModal
          patientId={offerTarget}
          onClose={() => setOfferTarget(null)}
          onSent={() => setOfferTarget(null)}
        />
      )}
    </div>
  );
}
