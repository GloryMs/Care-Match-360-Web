// src/features/notifications/NotificationsPage.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, Sparkles, FileText, CreditCard, AlertCircle, Info, Check } from 'lucide-react';

const MOCK_NOTIFS = [
  { id:'n1', type:'IN_APP', title:'New match found!',               body:'Sonnengarten Pflegeheim matches your profile with a score of 91%.', createdAt:'2026-02-22T10:00:00', read:false, icon:Sparkles,  color:'var(--primary-600)' },
  { id:'n2', type:'IN_APP', title:'Offer received',                  body:'Mobile Care Plus sent you a personalized care offer.',              createdAt:'2026-02-22T08:30:00', read:false, icon:FileText,  color:'#2563eb' },
  { id:'n3', type:'IN_APP', title:'Offer accepted',                  body:'Your offer to Patient #A-1038 was accepted.',                       createdAt:'2026-02-21T14:00:00', read:false, icon:Check,     color:'#16a34a' },
  { id:'n4', type:'IN_APP', title:'Subscription renewed',            body:'Your Pro plan has been renewed for another month. Invoice available.', createdAt:'2026-02-20T09:00:00', read:true, icon:CreditCard, color:'#d97706' },
  { id:'n5', type:'IN_APP', title:'Profile update reminder',         body:'Your profile is 65% complete. Add lifestyle info to get better matches.', createdAt:'2026-02-19T11:00:00', read:true, icon:Info,   color:'#7c3aed' },
  { id:'n6', type:'IN_APP', title:'Match score recalculated',        body:'New providers in your area updated your match scores.',              createdAt:'2026-02-18T15:00:00', read:true, icon:Sparkles,  color:'var(--primary-600)' },
];

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const [filter, setFilter] = useState('ALL');

  const markAllRead = () => setNotifs(prev => prev.map(n => ({...n, read:true})));
  const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? {...n, read:true} : n));

  const unread = notifs.filter(n => !n.read).length;
  const filtered = filter === 'UNREAD' ? notifs.filter(n => !n.read) : notifs;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{background:'var(--bg-page)'}}>
      <div className="mb-6 animate-fade-in-up flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif font-bold text-2xl" style={{color:'var(--text-main)'}}>{t('nav.notifications')}</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>{unread} unread notifications</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
            style={{borderColor:'var(--primary-300)',color:'var(--primary-700)'}}>
            <CheckCheck size={15}/> Mark all read
          </button>
        )}
      </div>
      {/* Filter */}
      <div className="flex gap-2 mb-6 animate-fade-in-up delay-100">
        {['ALL','UNREAD'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className="px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all"
            style={{
              background: filter===f ? 'var(--primary-600)' : 'var(--bg-card)',
              color: filter===f ? '#fff' : 'var(--text-muted)',
              borderColor: filter===f ? 'var(--primary-600)' : 'var(--border)'
            }}>
            {f === 'ALL' ? `All (${notifs.length})` : `Unread (${unread})`}
          </button>
        ))}
      </div>
      {/* Notification list */}
      <div
        className="rounded-2xl border overflow-hidden animate-fade-in-up delay-200"
        style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
        {filtered.map((n, i) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className="flex items-start gap-4 p-4 cursor-pointer transition-colors hover:opacity-90"
              style={{
                background: !n.read ? `color-mix(in srgb, ${n.color} 5%, var(--bg-card))` : 'var(--bg-card)',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none'
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{background:`${n.color}18`}}>
                <Icon size={18} style={{color:n.color}}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm" style={{color:'var(--text-main)'}}>{n.title}</p>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:'var(--primary-500)'}}/>
                  )}
                </div>
                <p className="text-xs mt-0.5 leading-relaxed" style={{color:'var(--text-muted)'}}>{n.body}</p>
                <p className="text-xs mt-1" style={{color:'var(--text-faint)'}}>{timeAgo(n.createdAt)}</p>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-16 text-center" style={{color:'var(--text-faint)'}}>
            <Bell size={32} className="mx-auto mb-3 opacity-40"/>
            <p>No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}