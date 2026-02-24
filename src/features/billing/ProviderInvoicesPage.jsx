// src/features/billing/ProviderInvoicesPage.jsx
// Real API — no mock data
import { useState, useEffect, useCallback } from 'react';
import {
  Receipt, Download, ExternalLink, CheckCircle2,
  XCircle, Clock, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, FileX,
} from 'lucide-react';
import { billingAPI }         from '../../api/billingService';
import { providerProfileAPI } from '../../api/profileService';
import { useToast } from '../../hooks/useToast';

// ─── Status config ────────────────────────────────────────────────────────────
const INV_STATUS = {
  PENDING: { icon: Clock,         color: '#d97706', bg: '#fffbeb', label: 'Pending' },
  PAID:    { icon: CheckCircle2,  color: '#16a34a', bg: '#f0fdf4', label: 'Paid'    },
  FAILED:  { icon: XCircle,       color: '#dc2626', bg: '#fef2f2', label: 'Failed'  },
  VOID:    { icon: AlertCircle,   color: '#9ca3af', bg: '#f9fafb', label: 'Void'    },
};

function StatusBadge({ status }) {
  const cfg  = INV_STATUS[status] || INV_STATUS.PENDING;
  const Icon = cfg.icon;
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ─── Invoice Row ──────────────────────────────────────────────────────────────
function InvoiceRow({ invoice }) {
  const handleDownload = () => {
    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank');
    } else {
      // fallback: direct API download
      const url = `${import.meta.env.VITE_BILLING_API_URL}/invoices/${invoice.id}/pdf`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm flex-wrap"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--primary-100)' }}>
        <Receipt size={18} style={{ color: 'var(--primary-600)' }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
            {invoice.invoiceNumber}
          </p>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
          <span>Issued: {new Date(invoice.issuedAt).toLocaleDateString()}</span>
          <span>Due: {new Date(invoice.dueAt).toLocaleDateString()}</span>
          {invoice.paidAt && <span>Paid: {new Date(invoice.paidAt).toLocaleDateString()}</span>}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right">
          <p className="font-bold text-base" style={{ color: 'var(--text-main)' }}>
            {invoice.currency} {Number(invoice.amount).toFixed(2)}
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}
        >
          <Download size={13} />
          PDF
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProviderInvoicesPage() {
  const toast = useToast();

  const [providerId,   setProviderId]   = useState(null);
  const [subId,        setSubId]        = useState(null);
  const [invoices,     setInvoices]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [page,         setPage]         = useState(0);
  const [totalPages,   setTotalPages]   = useState(0);
  const [total,        setTotal]        = useState(0);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const PAGE_SIZE = 10;

  useEffect(() => {
    providerProfileAPI.getMyProfile().then(r => setProviderId(r.data.data.id))
      .catch(() => setError('Failed to load provider profile'));
  }, []);

  // Load subscription to get subId
  useEffect(() => {
    if (!providerId) return;
    billingAPI.getProviderSubscription(providerId)
      .then(r => setSubId(r.data.data.id))
      .catch(() => {});  // No sub yet is fine
  }, [providerId]);

  const loadInvoices = useCallback(async () => {
    if (!subId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res  = await billingAPI.getSubscriptionInvoices(subId, page, PAGE_SIZE);
      const data = res.data.data;
      const content = data.content ?? data;
      setInvoices(content);
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.totalElements ?? content.length);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [subId, page]);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  // Summary stats
  const paid  = invoices.filter(i => i.status === 'PAID');
  const total_paid = paid.reduce((sum, i) => sum + Number(i.amount), 0);

  const displayed = filterStatus === 'ALL' ? invoices : invoices.filter(i => i.status === filterStatus);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--bg-page)' }}>
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-serif font-bold" style={{ color: 'var(--text-main)' }}>
          Invoices
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Your billing history and invoice downloads
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 animate-fade-in-up delay-100">
        {[
          { label: 'Total Invoices', value: total,                        color: 'var(--primary-600)' },
          { label: 'Paid',           value: paid.length,                  color: '#16a34a'            },
          { label: 'Total Paid',     value: `€${total_paid.toFixed(2)}`,  color: '#d97706'            },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-4"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-5 animate-fade-in-up delay-200">
        {['ALL', 'PENDING', 'PAID', 'FAILED', 'VOID'].map(s => (
          <button key={s}
            onClick={() => setFilterStatus(s)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
            style={{
              background:  filterStatus === s ? 'var(--primary-600)' : 'var(--bg-card)',
              color:       filterStatus === s ? '#fff' : 'var(--text-muted)',
              borderColor: filterStatus === s ? 'var(--primary-600)' : 'var(--border)',
            }}>
            {s === 'ALL' ? 'All' : INV_STATUS[s]?.label ?? s}
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
          <button onClick={loadInvoices}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--primary-600)', color: '#fff' }}>Retry</button>
        </div>
      ) : !subId ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <FileX size={48} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
          <p className="font-semibold" style={{ color: 'var(--text-main)' }}>No subscription found</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Subscribe to a plan to see invoices here.
          </p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Receipt size={48} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
          <p className="font-semibold" style={{ color: 'var(--text-main)' }}>No invoices yet</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Invoices will appear here once your billing cycle starts.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 animate-fade-in-up delay-300">
            {displayed.map(inv => <InvoiceRow key={inv.id} invoice={inv} />)}
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