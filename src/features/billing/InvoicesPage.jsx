// src/features/billing/InvoicesPage.jsx
import { useTranslation } from 'react-i18next';
import { Receipt, Download, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

const MOCK_INVOICES = [
  { id:'inv1', number:'INV-2026-003', amount:99.99, status:'PAID',    period:'Feb 2026', issuedAt:'2026-02-01T00:00:00', tier:'PRO' },
  { id:'inv2', number:'INV-2026-002', amount:99.99, status:'PAID',    period:'Jan 2026', issuedAt:'2026-01-01T00:00:00', tier:'PRO' },
  { id:'inv3', number:'INV-2025-012', amount:49.99, status:'PAID',    period:'Dec 2025', issuedAt:'2025-12-01T00:00:00', tier:'BASIC' },
  { id:'inv4', number:'INV-2025-011', amount:49.99, status:'FAILED',  period:'Nov 2025', issuedAt:'2025-11-01T00:00:00', tier:'BASIC' },
  { id:'inv5', number:'INV-2025-010', amount:49.99, status:'VOID',    period:'Oct 2025', issuedAt:'2025-10-01T00:00:00', tier:'BASIC' },
];

const STATUS_CONFIG = {
  PAID:    { icon: CheckCircle2, color:'#16a34a', bg:'#f0fdf4', label:'Paid' },
  PENDING: { icon: Clock,        color:'#d97706', bg:'#fffbeb', label:'Pending' },
  FAILED:  { icon: XCircle,      color:'#dc2626', bg:'#fef2f2', label:'Failed' },
  VOID:    { icon: AlertCircle,  color:'#9ca3af', bg:'#f9fafb', label:'Void' },
};

export default function InvoicesPage() {
  const { t } = useTranslation();
  const total = MOCK_INVOICES.filter(i=>i.status==='PAID').reduce((s,i)=>s+i.amount,0);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{background:'var(--bg-page)'}}>
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-serif font-bold text-2xl" style={{color:'var(--text-main)'}}>{t('nav.invoices')}</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Total paid: <strong style={{color:'var(--primary-600)'}}>€{total.toFixed(2)}</strong></p>
      </div>
      <div
        className="rounded-2xl border overflow-hidden animate-fade-in-up delay-100"
        style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wide border-b"
          style={{background:'var(--bg-subtle)',borderColor:'var(--border)',color:'var(--text-muted)'}}>
          <div className="col-span-4">Invoice</div>
          <div className="col-span-2 hidden md:block">Period</div>
          <div className="col-span-2 hidden md:block">Plan</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2">Status</div>
        </div>
        {MOCK_INVOICES.map((inv, i) => {
          const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.PENDING;
          const Icon = cfg.icon;
          return (
            <div key={inv.id}
              className="grid grid-cols-12 gap-4 items-center px-5 py-4 transition-colors hover:opacity-90"
              style={{borderBottom: i < MOCK_INVOICES.length-1 ? '1px solid var(--border)' : 'none'}}>
              <div className="col-span-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{background:'var(--primary-100)'}}>
                    <Receipt size={14} style={{color:'var(--primary-600)'}}/>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{color:'var(--text-main)'}}>{inv.number}</p>
                    <p className="text-xs" style={{color:'var(--text-muted)'}}>
                      {new Date(inv.issuedAt).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-span-2 hidden md:block text-sm" style={{color:'var(--text-muted)'}}>{inv.period}</div>
              <div className="col-span-2 hidden md:block">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{background:'var(--primary-100)',color:'var(--primary-700)'}}>{inv.tier}</span>
              </div>
              <div className="col-span-2 font-bold text-sm" style={{color:'var(--text-main)'}}>€{inv.amount.toFixed(2)}</div>
              <div className="col-span-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold"
                  style={{background:cfg.bg,color:cfg.color}}>
                  <Icon size={10}/> {cfg.label}
                </span>
                {inv.status === 'PAID' && (
                  <button className="p-1.5 rounded-lg transition-colors hover:opacity-70" title="Download PDF"
                    style={{color:'var(--text-muted)'}}>
                    <Download size={14}/>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}