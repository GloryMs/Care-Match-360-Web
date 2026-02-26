// src/features/matching/OffersPage.jsx
// Real API — patients view received offers and accept/reject them
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  FileText, CheckCircle2, XCircle, Clock, Bell,
  Activity, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, RefreshCw,
} from 'lucide-react';
import { offerAPI } from '../../api/matchService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

const STATUS_CONFIG = {
  DRAFT:    { icon: Clock,        color: '#6b7280', bg: '#f3f4f6', label: 'Draft'    },
  SENT:     { icon: Bell,         color: '#4a7a8a', bg: '#f0f6f8', label: 'Received' },
  VIEWED:   { icon: Activity,     color: '#d97706', bg: '#fffbeb', label: 'Viewed'   },
  ACCEPTED: { icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4', label: 'Accepted' },
  REJECTED: { icon: XCircle,      color: '#dc2626', bg: '#fef2f2', label: 'Declined' },
  EXPIRED:  { icon: AlertCircle,  color: '#9ca3af', bg: '#f9fafb', label: 'Expired'  },
};

const FILTERS = ['ALL', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED'];
const PAGE_SIZE = 20;

export default function OffersPage() {
  const { t, } = useTranslation();
  const { isProvider } = useAuth();
  const profileId = useSelector(s => s.auth.profileId);
  const toast = useToast();

  const [offers,      setOffers]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [page,        setPage]        = useState(0);
  const [totalPages,  setTotalPages]  = useState(0);
  const [total,       setTotal]       = useState(0);
  const [active,      setActive]      = useState('ALL');
  const [actingId,    setActingId]    = useState(null); // offerId being accepted/rejected

  const loadOffers = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    setError(null);
    try {
      const res = isProvider
        ? await offerAPI.getProviderOffers(profileId, page, PAGE_SIZE)
        : await offerAPI.getPatientOffers(profileId, page, PAGE_SIZE);
      const data = res.data.data;
      const content = data.content ?? data;
      setOffers(Array.isArray(content) ? content : []);
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.totalElements ?? content.length);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  }, [profileId, isProvider, page]);

  useEffect(() => { loadOffers(); }, [loadOffers]);

  const handleAccept = async (offerId) => {
    setActingId(offerId);
    try {
      await offerAPI.accept(offerId);
      toast.success('Offer accepted');
      loadOffers();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to accept offer');
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (offerId) => {
    setActingId(offerId);
    try {
      await offerAPI.reject(offerId);
      toast.success('Offer declined');
      loadOffers();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to decline offer');
    } finally {
      setActingId(null);
    }
  };

  const displayed = active === 'ALL' ? offers : offers.filter(o => o.status === active);

  const countFor = (status) => offers.filter(o => o.status === status).length;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6 animate-fade-in-up">
        <div>
          <h1 className="font-serif font-bold text-2xl" style={{ color: 'var(--text-main)' }}>
            {t('nav.offers')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {isProvider ? 'Offers you have sent to patients' : 'Offers received from care providers'}
          </p>
        </div>
        <button onClick={loadOffers}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6 animate-fade-in-up delay-100">
        {FILTERS.map(f => {
          const cfg = STATUS_CONFIG[f];
          return (
            <button key={f} onClick={() => setActive(f)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
              style={{
                background:  active === f ? (cfg ? cfg.bg : 'var(--primary-100)') : 'var(--bg-card)',
                color:       active === f ? (cfg ? cfg.color : 'var(--primary-700)') : 'var(--text-muted)',
                borderColor: active === f ? (cfg ? cfg.color + '40' : 'var(--primary-300)') : 'var(--border)',
              }}>
              {f === 'ALL' ? `All (${total})` : `${STATUS_CONFIG[f]?.label ?? f} (${countFor(f)})`}
            </button>
          );
        })}
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
        <div className="py-20 text-center rounded-xl border border-dashed"
          style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}>
          <FileText size={32} className="mx-auto mb-3 opacity-40" />
          <p>No offers in this category</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {displayed.map((o, i) => {
              const cfg  = STATUS_CONFIG[o.status] || STATUS_CONFIG.SENT;
              const Icon = cfg.icon;
              const date = new Date(o.createdAt ?? o.sentAt).toLocaleDateString(undefined, {
                month: 'long', day: 'numeric', year: 'numeric',
              });
              const isActing = actingId === o.id;
              const partyName = isProvider
                ? (o.patientName || `Patient #${o.patientId?.slice(-6)}`)
                : (o.providerName || `Provider #${o.providerId?.slice(-6)}`);

              return (
                <div key={o.id} className={`p-5 rounded-2xl border animate-fade-in-up delay-${Math.min((i + 1) * 100, 500)}`}
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h3 className="font-semibold text-base" style={{ color: 'var(--text-main)' }}>{partyName}</h3>
                        {o.matchScore && (
                          <span className="font-bold text-sm" style={{ color: 'var(--primary-600)' }}>
                            {Math.round(o.matchScore)}% match
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{o.message}</p>
                      {o.availabilityDetails?.availableFrom && (
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                          Available from: {o.availabilityDetails.availableFrom}
                          {o.availabilityDetails.roomType && ` · ${o.availabilityDetails.roomType.replace(/_/g, ' ')}`}
                        </p>
                      )}
                      <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>{date}</p>
                    </div>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      <Icon size={12} /> {cfg.label}
                    </span>
                  </div>

                  {/* Patient actions: accept / decline for SENT or VIEWED offers */}
                  {(o.status === 'SENT' || o.status === 'VIEWED') && !isProvider && (
                    <div className="flex gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                      <button
                        onClick={() => handleAccept(o.id)}
                        disabled={!!actingId}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                        style={{ background: 'var(--primary-600)' }}>
                        {isActing ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                        Accept Offer
                      </button>
                      <button
                        onClick={() => handleReject(o.id)}
                        disabled={!!actingId}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-red-50 disabled:opacity-60"
                        style={{ borderColor: '#fca5a5', color: '#dc2626' }}>
                        {isActing ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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
