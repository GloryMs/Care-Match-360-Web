// src/features/matching/OffersPage.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, CheckCircle2, XCircle, Clock, Bell, Activity, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const MOCK_OFFERS = [
  { id:'o1', partyName:'Sonnengarten Pflegeheim', status:'SENT',     sentAt:'2026-02-20T09:00:00', score:91, message:'We have availability from March 1st and believe we are an excellent match for your care needs. Our facility specializes in dementia care with a dedicated team.' },
  { id:'o2', partyName:'Mobile Care Plus',        status:'VIEWED',   sentAt:'2026-02-19T14:30:00', score:84, message:'Our team can provide daily home visits tailored to your schedule, 7 days a week.' },
  { id:'o3', partyName:'Haus am See',             status:'ACCEPTED', sentAt:'2026-02-15T10:00:00', score:78, message:'We look forward to welcoming you to our facility.' },
  { id:'o4', partyName:'Ambulanz Süd',            status:'REJECTED', sentAt:'2026-02-10T08:00:00', score:72, message:'Our services are available in your area with flexible timing.' },
  { id:'o5', partyName:'Seniorenheim Westpark',   status:'EXPIRED',  sentAt:'2026-02-01T09:00:00', score:68, message:'We had a spot available for immediate move-in.' },
];

const STATUS_CONFIG = {
  DRAFT:    { icon: Clock,        color:'#6b7280', bg:'#f3f4f6', label:'Draft'    },
  SENT:     { icon: Bell,         color:'#2563eb', bg:'#eff6ff', label:'Received' },
  VIEWED:   { icon: Activity,     color:'#d97706', bg:'#fffbeb', label:'Viewed'   },
  ACCEPTED: { icon: CheckCircle2, color:'#16a34a', bg:'#f0fdf4', label:'Accepted' },
  REJECTED: { icon: XCircle,      color:'#dc2626', bg:'#fef2f2', label:'Rejected' },
  EXPIRED:  { icon: AlertCircle,  color:'#9ca3af', bg:'#f9fafb', label:'Expired'  },
};

const FILTERS = ['ALL','SENT','VIEWED','ACCEPTED','REJECTED','EXPIRED'];

export default function OffersPage() {
  const { t } = useTranslation();
  const { isProvider } = useAuth();
  const [active, setActive] = useState('ALL');
  const filtered = active === 'ALL' ? MOCK_OFFERS : MOCK_OFFERS.filter(o => o.status === active);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{background:'var(--bg-page)'}}>
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-serif font-bold text-2xl" style={{color:'var(--text-main)'}}>{t('nav.offers')}</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>
          {isProvider ? 'Offers you have sent to patients' : 'Offers received from care providers'}
        </p>
      </div>
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6 animate-fade-in-up delay-100">
        {FILTERS.map(f => {
          const cfg = STATUS_CONFIG[f];
          return (
            <button key={f} onClick={()=>setActive(f)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
              style={{
                background: active===f ? (cfg ? cfg.bg : 'var(--primary-100)') : 'var(--bg-card)',
                color: active===f ? (cfg ? cfg.color : 'var(--primary-700)') : 'var(--text-muted)',
                borderColor: active===f ? (cfg ? cfg.color+'40' : 'var(--primary-300)') : 'var(--border)'
              }}>
              {f === 'ALL' ? `All (${MOCK_OFFERS.length})` : `${f.charAt(0)+f.slice(1).toLowerCase()} (${MOCK_OFFERS.filter(o=>o.status===f).length})`}
            </button>
          );
        })}
      </div>
      {/* Offer cards */}
      <div className="flex flex-col gap-4">
        {filtered.map((o,i) => {
          const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.SENT;
          const Icon = cfg.icon;
          const date = new Date(o.sentAt).toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'});
          return (
            <div key={o.id} className={`p-5 rounded-2xl border animate-fade-in-up delay-${(i+1)*100}`}
              style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="font-semibold text-base" style={{color:'var(--text-main)'}}>{o.partyName}</h3>
                    <span className="font-bold text-sm" style={{color:'var(--primary-600)'}}>{o.score}% match</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{color:'var(--text-muted)'}}>{o.message}</p>
                  <p className="text-xs mt-2" style={{color:'var(--text-faint)'}}>{date}</p>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0"
                  style={{background:cfg.bg, color:cfg.color}}>
                  <Icon size={12}/> {cfg.label}
                </span>
              </div>
              {(o.status === 'SENT' || o.status === 'VIEWED') && !isProvider && (
                <div className="flex gap-3 mt-4 pt-4 border-t" style={{borderColor:'var(--border)'}}>
                  <button className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{background:'var(--primary-600)'}}>
                    <CheckCircle2 size={15}/> Accept Offer
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-red-50"
                    style={{borderColor:'#fca5a5', color:'#dc2626'}}>
                    <XCircle size={15}/> Decline
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-20 text-center rounded-xl border border-dashed" style={{borderColor:'var(--border)',color:'var(--text-faint)'}}>
            <FileText size={32} className="mx-auto mb-3 opacity-40"/>
            <p>No offers in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}