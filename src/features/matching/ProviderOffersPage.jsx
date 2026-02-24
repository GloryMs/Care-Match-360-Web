// src/features/matching/ProviderOffersPage.jsx
// Real API — no mock data
import { useState, useEffect, useCallback } from 'react';
import {
  FileText, Send, Trash2, Eye, Clock, CheckCircle2,
  XCircle, AlertCircle, Loader2, ChevronLeft, ChevronRight,
  RefreshCw, Bell, Filter, Plus,
} from 'lucide-react';
import { offerAPI }           from '../../api/matchService';
import { providerProfileAPI } from '../../api/profileService';
import { useAuth  } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  DRAFT:    { icon: Clock,         color: '#6b7280', bg: '#f3f4f6', label: 'Draft'    },
  SENT:     { icon: Send,          color: '#4a7a8a', bg: '#f0f6f8', label: 'Sent'     },
  VIEWED:   { icon: Eye,           color: '#d97706', bg: '#fffbeb', label: 'Viewed'   },
  ACCEPTED: { icon: CheckCircle2,  color: '#16a34a', bg: '#f0fdf4', label: 'Accepted' },
  REJECTED: { icon: XCircle,       color: '#dc2626', bg: '#fef2f2', label: 'Declined' },
  EXPIRED:  { icon: AlertCircle,   color: '#9ca3af', bg: '#f9fafb', label: 'Expired'  },
};

function StatusBadge({ status }) {
  const cfg = STATUS[status] || STATUS.DRAFT;
  const Icon = cfg.icon;
  return (
    <span
      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ─── Offer History Modal ──────────────────────────────────────────────────────
function OfferHistoryModal({ offerId, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    offerAPI.getHistory(offerId)
      .then(r => setHistory(r.data.data ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [offerId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl shadow-2xl p-6" style={{ background: 'var(--bg-card)' }}>
        <h2 className="text-lg font-serif font-bold mb-4" style={{ color: 'var(--text-main)' }}>
          Offer History
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary-500)' }} />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No history found</p>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map(h => (
              <div key={h.id} className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'var(--bg-subtle)' }}>
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{ background: STATUS[h.newStatus]?.color || '#6b7280' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                    {h.oldStatus ? `${h.oldStatus} → ` : ''}{h.newStatus}
                  </p>
                  {h.notes && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{h.notes}</p>}
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {new Date(h.changedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-xl border text-sm font-semibold transition-all"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Create Offer Modal ───────────────────────────────────────────────────────
function CreateOfferModal({ onClose, onCreated }) {
  const toast = useToast();
  const [patientId, setPatientId] = useState('');
  const [message,   setMessage]   = useState('');
  const [avFrom,    setAvFrom]    = useState('');
  const [roomType,  setRoomType]  = useState('SINGLE');
  const [sendNow,   setSendNow]   = useState(false);
  const [saving,    setSaving]    = useState(false);

  const handleSubmit = async () => {
    if (!patientId.trim()) { toast.warning('Enter Patient ID'); return; }
    if (!message.trim())   { toast.warning('Enter a message');  return; }
    setSaving(true);
    try {
      const payload = {
        patientId: patientId.trim(),
        message,
        availabilityDetails: avFrom ? { availableFrom: avFrom, roomType } : undefined,
      };
      const res = await offerAPI.create(payload);
      const offerId = res.data.data.id;
      if (sendNow) {
        await offerAPI.send(offerId);
        toast.success('Offer created and sent');
      } else {
        toast.success('Offer saved as draft');
      }
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create offer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl p-6" style={{ background: 'var(--bg-card)' }}>
        <h2 className="text-lg font-serif font-bold mb-4" style={{ color: 'var(--text-main)' }}>
          Create Offer
        </h2>

        <label className="block mb-3">
          <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-main)' }}>Patient ID *</span>
          <input
            type="text"
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
            placeholder="UUID of patient profile"
            className="w-full rounded-xl border px-3 py-2.5 text-sm"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-page)', color: 'var(--text-main)' }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Find patient ID from your Matches page
          </p>
        </label>

        <label className="block mb-3">
          <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-main)' }}>Message *</span>
          <textarea
            rows={4}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Describe your care offering..."
            className="w-full rounded-xl border px-3 py-2.5 text-sm resize-none"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-page)', color: 'var(--text-main)' }}
          />
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
              {['SINGLE','DOUBLE','SUITE','DEMENTIA_UNIT','PALLIATIVE_WARD'].map(r => (
                <option key={r} value={r}>{r.replace(/_/g,' ')}</option>
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
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            {sendNow ? 'Create & Send' : 'Save Draft'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Offer Card ───────────────────────────────────────────────────────────────
function OfferCard({ offer, onSend, onViewHistory, sendingId }) {
  const isSending = sendingId === offer.id;
  const avail = offer.availabilityDetails || {};
  return (
    <div className="rounded-xl border transition-all hover:shadow-sm p-4"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
              {offer.patientName || `Patient #${offer.patientId?.slice(-6)}`}
            </p>
            <StatusBadge status={offer.status} />
            {offer.matchScore && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                {Math.round(offer.matchScore)}% match
              </span>
            )}
          </div>
          <p className="text-sm line-clamp-2 mb-2" style={{ color: 'var(--text-muted)' }}>
            {offer.message}
          </p>
          <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
            {avail.availableFrom && <span>📅 From {avail.availableFrom}</span>}
            {avail.roomType && <span>🚪 {avail.roomType?.replace(/_/g,' ')}</span>}
            <span>Created {new Date(offer.createdAt).toLocaleDateString()}</span>
            {offer.expiresAt && (
              <span>Expires {new Date(offer.expiresAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          {offer.status === 'DRAFT' && (
            <button
              onClick={() => onSend(offer.id)}
              disabled={isSending}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
              style={{ background: 'var(--primary-600)', color: '#fff' }}>
              {isSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              Send
            </button>
          )}
          <button
            onClick={() => onViewHistory(offer.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}>
            <Clock size={12} />
            History
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProviderOffersPage() {
  const { user } = useAuth();
  const toast    = useToast();

  const [providerId,    setProviderId]    = useState(null);
  const [offers,        setOffers]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [total,         setTotal]         = useState(0);
  const [filterStatus,  setFilterStatus]  = useState('ALL');
  const [historyOfferId,setHistoryOfferId]= useState(null);
  const [sendingId,     setSendingId]     = useState(null);
  const [showCreate,    setShowCreate]    = useState(false);

  const PAGE_SIZE = 10;

  useEffect(() => {
    providerProfileAPI.getMyProfile()
      .then(r => setProviderId(r.data.data.id))
      .catch(() => setError('Failed to load provider profile'));
  }, []);

  const loadOffers = useCallback(async () => {
    if (!providerId) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await offerAPI.getProviderOffers(providerId, page, PAGE_SIZE);
      const data = res.data.data;
      const content = data.content ?? data;
      setOffers(content);
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.totalElements ?? content.length);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  }, [providerId, page]);

  useEffect(() => { loadOffers(); }, [loadOffers]);

  const handleSend = async (offerId) => {
    setSendingId(offerId);
    try {
      await offerAPI.send(offerId);
      toast.success('Offer sent');
      loadOffers();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to send offer');
    } finally {
      setSendingId(null);
    }
  };

  // Summary stats
  const stats = {
    total:    offers.length,
    sent:     offers.filter(o => o.status === 'SENT').length,
    accepted: offers.filter(o => o.status === 'ACCEPTED').length,
    pending:  offers.filter(o => ['DRAFT','SENT','VIEWED'].includes(o.status)).length,
  };

  const displayed = filterStatus === 'ALL' ? offers : offers.filter(o => o.status === filterStatus);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-serif font-bold" style={{ color: 'var(--text-main)' }}>
            Sent Offers
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Manage your care proposals to patients
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--primary-600)', color: '#fff' }}>
          <Plus size={16} />
          New Offer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-fade-in-up delay-100">
        {[
          { label: 'Total Offers', value: total, color: 'var(--primary-600)' },
          { label: 'Pending',      value: stats.pending,  color: '#d97706' },
          { label: 'Sent',         value: stats.sent,     color: '#4a7a8a' },
          { label: 'Accepted',     value: stats.accepted, color: '#16a34a' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-4"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-5 animate-fade-in-up delay-200">
        {['ALL', 'DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
            style={{
              background:  filterStatus === s ? 'var(--primary-600)' : 'var(--bg-card)',
              color:       filterStatus === s ? '#fff' : 'var(--text-muted)',
              borderColor: filterStatus === s ? 'var(--primary-600)' : 'var(--border)',
            }}
          >
            {s === 'ALL' ? 'All' : STATUS[s]?.label ?? s}
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
          <button onClick={loadOffers}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--primary-600)', color: '#fff' }}>Retry</button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <FileText size={48} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
          <p className="font-semibold" style={{ color: 'var(--text-main)' }}>No offers yet</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Browse matches and send your first care offer
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 animate-fade-in-up delay-300">
            {displayed.map(o => (
              <OfferCard
                key={o.id}
                offer={o}
                onSend={handleSend}
                onViewHistory={setHistoryOfferId}
                sendingId={sendingId}
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

      {historyOfferId && (
        <OfferHistoryModal offerId={historyOfferId} onClose={() => setHistoryOfferId(null)} />
      )}

      {showCreate && (
        <CreateOfferModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadOffers(); }}
        />
      )}
    </div>
  );
}