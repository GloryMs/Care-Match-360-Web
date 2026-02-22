// src/features/profile/PatientProfilePage.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, MapPin, Heart, Shield, Save, Upload } from 'lucide-react';

const TABS = [
  { id:'basic',   label:'Basic Info',         icon: User   },
  { id:'care',    label:'Care Needs',          icon: Heart  },
  { id:'medical', label:'Medical Info',        icon: Shield },
];

export default function PatientProfilePage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('basic');
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(()=>setSaved(false), 2000); };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{background:'var(--bg-page)'}}>
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-serif font-bold text-2xl" style={{color:'var(--text-main)'}}>Patient Profile</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Manage your care profile to get better matches</p>
      </div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap animate-fade-in-up delay-100">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
            style={{
              background: tab===t.id ? 'var(--primary-600)' : 'var(--bg-card)',
              color: tab===t.id ? '#fff' : 'var(--text-muted)',
              borderColor: tab===t.id ? 'var(--primary-600)' : 'var(--border)'
            }}>
            <t.icon size={15}/> {t.label}
          </button>
        ))}
      </div>
      {/* Form */}
      <div className="animate-fade-in-up delay-200 p-6 rounded-2xl border max-w-2xl"
        style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
        {tab === 'basic' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{color:'var(--text-main)'}}>Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label:'First Name', placeholder:'e.g. Heinrich' },
                { label:'Last Name',  placeholder:'e.g. Müller'   },
              ].map(f=>(
                <div key={f.label}>
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" placeholder={f.placeholder}/>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-input"/>
              </div>
              <div>
                <label className="form-label">Gender</label>
                <select className="form-input">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">ZIP Code</label>
                <input className="form-input" placeholder="e.g. 80331"/>
              </div>
              <div>
                <label className="form-label">Search Radius (km)</label>
                <input type="number" className="form-input" placeholder="e.g. 20" min={1} max={100}/>
              </div>
            </div>
            <div>
              <label className="form-label">Preferred Language</label>
              <select className="form-input">
                <option>German</option><option>English</option><option>Arabic</option><option>Turkish</option>
              </select>
            </div>
          </div>
        )}
        {tab === 'care' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{color:'var(--text-main)'}}>Care Needs</h2>
            <div>
              <label className="form-label">Care Level (Pflegegrad)</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {[1,2,3,4,5].map(l=>(
                  <button key={l}
                    className="w-12 h-12 rounded-xl border-2 font-bold text-lg transition-all hover:scale-105"
                    style={{borderColor: l===3 ? 'var(--primary-500)' : 'var(--border)', background: l===3 ? 'var(--primary-50)' : 'var(--bg-card)', color: l===3 ? 'var(--primary-700)' : 'var(--text-muted)'}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label">Care Type Required</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {['Residential','Ambulatory','Combined'].map(type=>(
                  <button key={type}
                    className="px-4 py-2 rounded-xl border text-sm font-semibold transition-all"
                    style={{borderColor: type==='Residential' ? 'var(--primary-500)' : 'var(--border)', background: type==='Residential' ? 'var(--primary-50)' : 'var(--bg-card)', color: type==='Residential' ? 'var(--primary-700)' : 'var(--text-muted)'}}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label">Mobility Level</label>
              <select className="form-input">
                <option>Fully mobile</option><option>Partially mobile</option><option>Wheelchair</option><option>Bedridden</option>
              </select>
            </div>
            <div>
              <label className="form-label">Social Interaction Preference</label>
              <select className="form-input">
                <option>Very social</option><option>Moderate</option><option>Quiet / private</option>
              </select>
            </div>
          </div>
        )}
        {tab === 'medical' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{color:'var(--text-main)'}}>Medical Requirements</h2>
            <div>
              <label className="form-label">Required Medical Services</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {['Basic nursing care','Medical treatment care','Dementia support','Palliative care','Mobility assistance','Wound care','Medication management','Physical therapy'].map(s=>(
                  <label key={s} className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all hover:border-primary-300"
                    style={{borderColor:'var(--border)'}}>
                    <input type="checkbox" className="rounded" style={{accentColor:'var(--primary-600)'}}/>
                    <span className="text-sm" style={{color:'var(--text-main)'}}>{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label">Additional Medical Notes</label>
              <textarea className="form-input" rows={4} placeholder="Describe any specific medical conditions or requirements..."/>
            </div>
            <div>
              <label className="form-label">Upload Documents (optional)</label>
              <div className="mt-1 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-primary-400"
                style={{borderColor:'var(--border)'}}>
                <Upload size={24} className="mx-auto mb-2" style={{color:'var(--text-faint)'}}/>
                <p className="text-sm" style={{color:'var(--text-muted)'}}>Click or drag to upload medical documents</p>
                <p className="text-xs mt-1" style={{color:'var(--text-faint)'}}>PDF, JPG, PNG up to 10MB</p>
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 pt-4 border-t flex justify-end" style={{borderColor:'var(--border)'}}>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{background: saved ? '#16a34a' : 'var(--primary-600)'}}>
            <Save size={15}/> {saved ? 'Saved!' : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}