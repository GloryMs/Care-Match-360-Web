// src/features/matching/MatchesPage.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, MapPin, Filter, Search, ChevronRight, Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { SectionHeader } from '../dashboard/StatCard';

const MOCK_MATCHES = [
  { id:'m1', providerName:'Sonnengarten Pflegeheim', type:'RESIDENTIAL', score:91, distance:'3.2 km', specializations:['Dementia Care','Palliative'], available:true,  city:'Munich' },
  { id:'m2', providerName:'Mobile Care Plus',        type:'AMBULATORY',  score:84, distance:'1.8 km', specializations:['Basic Nursing','Mobility'],   available:true,  city:'Munich' },
  { id:'m3', providerName:'Haus am See',             type:'RESIDENTIAL', score:78, distance:'5.1 km', specializations:['Medical Treatment'],           available:false, city:'Starnberg' },
  { id:'m4', providerName:'Ambulanz Süd',            type:'AMBULATORY',  score:74, distance:'4.4 km', specializations:['Basic Nursing'],               available:true,  city:'Munich' },
  { id:'m5', providerName:'Seniorenheim Westpark',   type:'RESIDENTIAL', score:71, distance:'6.2 km', specializations:['Dementia Care'],               available:true,  city:'Munich' },
];

function ScoreRing({ score }) {
  const r = 22; const circ = 2 * Math.PI * r; const fill = (score / 100) * circ;
  const color = score >= 80 ? 'var(--primary-500)' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--border)" strokeWidth="4"/>
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${fill} ${circ}`}/>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{color}}>{score}%</span>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const { t } = useTranslation();
  const { isProvider } = useAuth();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const filtered = MOCK_MATCHES.filter(m =>
    (filterType === 'ALL' || m.type === filterType) &&
    m.providerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8" style={{background:'var(--bg-page)'}}>
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-serif font-bold text-2xl" style={{color:'var(--text-main)'}}>{t('nav.matches')}</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>
          {isProvider ? 'Patients matched to your profile' : 'Care providers matched to your needs'}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in-up delay-100">
        <div className="flex-1 relative">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2" style={{color:'var(--text-muted)'}}/>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="form-input ps-9"
          />
        </div>
        {['ALL','RESIDENTIAL','AMBULATORY'].map(f=>(
          <button key={f} onClick={()=>setFilterType(f)}
            className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
            style={{
              background: filterType===f ? 'var(--primary-600)' : 'var(--bg-card)',
              color: filterType===f ? '#fff' : 'var(--text-muted)',
              borderColor: filterType===f ? 'var(--primary-600)' : 'var(--border)'
            }}>
            {f === 'ALL' ? 'All' : f === 'RESIDENTIAL' ? '🏠 Residential' : '🚗 Ambulatory'}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {filtered.map((m,i)=>(
          <div key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md animate-fade-in-up delay-${(i+1)*100}`}
            style={{background:'var(--bg-card)', borderColor:'var(--border)'}}>
            <ScoreRing score={m.score}/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold" style={{color:'var(--text-main)'}}>{m.providerName}</p>
                {!m.available && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Unavailable</span>}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap text-xs" style={{color:'var(--text-muted)'}}>
                <span className="flex items-center gap-1"><MapPin size={10}/>{m.distance} · {m.city}</span>
                <span className="px-2 py-0.5 rounded-full font-medium" style={{background:'var(--primary-100)',color:'var(--primary-700)'}}>
                  {m.type === 'RESIDENTIAL' ? '🏠 Residential' : '🚗 Ambulatory'}
                </span>
              </div>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {m.specializations.map(s=>(
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{background:'var(--bg-subtle)',color:'var(--text-muted)'}}>{s}</span>
                ))}
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 flex-shrink-0"
              style={{background:'var(--primary-600)'}}>
              {isProvider ? 'Send Offer' : 'View Details'}
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center rounded-xl border border-dashed" style={{borderColor:'var(--border)',color:'var(--text-faint)'}}>
            <Sparkles size={32} className="mx-auto mb-3 opacity-40"/>
            <p>No matches found</p>
          </div>
        )}
      </div>
    </div>
  );
}