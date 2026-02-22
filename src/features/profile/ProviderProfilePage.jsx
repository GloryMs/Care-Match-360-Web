// src/features/profile/ProviderProfilePage.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, MapPin, Users, Clock, Save, Upload } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const RES_TABS  = ['Facility Info','Capacity & Rooms','Specializations'];
const AMB_TABS  = ['Business Info','Service Area','Availability'];

export default function ProviderProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isResidential = user?.role === 'RESIDENTIAL_PROVIDER';
  const TABS = isResidential ? RES_TABS : AMB_TABS;
  const [tab, setTab] = useState(TABS[0]);
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(()=>setSaved(false), 2000); };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{background:'var(--bg-page)'}}>
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-serif font-bold text-2xl" style={{color:'var(--text-main)'}}>
          {isResidential ? 'Residential' : 'Ambulatory'} Provider Profile
        </h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>
          Complete your profile to attract the best patient matches
        </p>
      </div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap animate-fade-in-up delay-100">
        {TABS.map(tb=>(
          <button key={tb} onClick={()=>setTab(tb)}
            className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
            style={{
              background: tab===tb ? 'var(--primary-600)' : 'var(--bg-card)',
              color: tab===tb ? '#fff' : 'var(--text-muted)',
              borderColor: tab===tb ? 'var(--primary-600)' : 'var(--border)'
            }}>
            {tb}
          </button>
        ))}
      </div>
      <div className="animate-fade-in-up delay-200 p-6 rounded-2xl border max-w-2xl"
        style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
        {/* Residential: Facility Info */}
        {isResidential && tab === 'Facility Info' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{color:'var(--text-main)'}}>Facility Information</h2>
            {[{label:'Facility Name',ph:'e.g. Sonnengarten Pflegeheim'},{label:'Registration Number',ph:'DE-12345'},{label:'Director Name',ph:'Dr. Anna Schmidt'}].map(f=>(
              <div key={f.label}><label className="form-label">{f.label}</label><input className="form-input" placeholder={f.ph}/></div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="form-label">ZIP Code</label><input className="form-input" placeholder="80331"/></div>
              <div><label className="form-label">City</label><input className="form-input" placeholder="Munich"/></div>
            </div>
            <div><label className="form-label">Full Address</label><textarea className="form-input" rows={2} placeholder="Street, number, city"/></div>
            <div><label className="form-label">Description</label><textarea className="form-input" rows={4} placeholder="Describe your facility, environment, and care philosophy..."/></div>
          </div>
        )}
        {isResidential && tab === 'Capacity & Rooms' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{color:'var(--text-main)'}}>Capacity & Rooms</h2>
            <div className="grid grid-cols-2 gap-4">
              {[{label:'Total Capacity',ph:'e.g. 80'},{label:'Available Rooms',ph:'e.g. 12'},{label:'Staff Count',ph:'e.g. 45'},{label:'Staff-to-Patient Ratio',ph:'e.g. 1:3'}].map(f=>(
                <div key={f.label}><label className="form-label">{f.label}</label><input type="number" className="form-input" placeholder={f.ph}/></div>
              ))}
            </div>
            <div>
              <label className="form-label">Room Types Available</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {['Single room','Double room','Suite','Dementia unit','Palliative ward'].map(rt=>(
                  <label key={rt} className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer" style={{borderColor:'var(--border)'}}>
                    <input type="checkbox" style={{accentColor:'var(--primary-600)'}}/><span className="text-sm" style={{color:'var(--text-main)'}}>{rt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div><label className="form-label">Earliest Availability Date</label><input type="date" className="form-input"/></div>
          </div>
        )}
        {isResidential && tab === 'Specializations' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{color:'var(--text-main)'}}>Specializations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {['Dementia care','Palliative care','Medical treatment','Basic nursing','Mobility assistance','Rehabilitation','Mental health','Wound care'].map(s=>(
                <label key={s} className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer" style={{borderColor:'var(--border)'}}>
                  <input type="checkbox" style={{accentColor:'var(--primary-600)'}}/><span className="text-sm" style={{color:'var(--text-main)'}}>{s}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="form-label">Upload Certificates / Documents</label>
              <div className="mt-1 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer"
                style={{borderColor:'var(--border)'}}>
                <Upload size={24} className="mx-auto mb-2" style={{color:'var(--text-faint)'}}/>
                <p className="text-sm" style={{color:'var(--text-muted)'}}>Upload accreditation, certifications</p>
              </div>
            </div>
          </div>
        )}
        {/* Ambulatory tabs */}
        {!isResidential && tab === 'Business Info' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{color:'var(--text-main)'}}>Business Information</h2>
            {[{label:'Business Name',ph:'e.g. Mobile Care Plus'},{label:'Registration Number',ph:'DE-AMB-99'},{label:'Contact Person',ph:'Maria Weber'}].map(f=>(
              <div key={f.label}><label className="form-label">{f.label}</label><input className="form-input" placeholder={f.ph}/></div>
            ))}
            <div><label className="form-label">Description</label><textarea className="form-input" rows={4} placeholder="Describe your ambulatory care services..."/></div>
            <div><label className="form-label">Max Daily Patients</label><input type="number" className="form-input" placeholder="e.g. 15"/></div>
          </div>
        )}
        {!isResidential && tab === 'Service Area' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{color:'var(--text-main)'}}>Service Area</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="form-label">Base ZIP Code</label><input className="form-input" placeholder="80331"/></div>
              <div><label className="form-label">Service Radius (km)</label><input type="number" className="form-input" placeholder="20"/></div>
            </div>
            <div><label className="form-label">Cities Served</label><input className="form-input" placeholder="Munich, Schwabing, Pasing..."/></div>
            <div>
              <label className="form-label">Specializations</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {['Basic nursing','Medical treatment','Dementia support','Palliative','Mobility','Wound care'].map(s=>(
                  <label key={s} className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer" style={{borderColor:'var(--border)'}}>
                    <input type="checkbox" style={{accentColor:'var(--primary-600)'}}/><span className="text-sm" style={{color:'var(--text-main)'}}>{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
        {!isResidential && tab === 'Availability' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{color:'var(--text-main)'}}>Available Time Windows</h2>
            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day=>(
              <div key={day} className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 w-28">
                  <input type="checkbox" defaultChecked={!['Saturday','Sunday'].includes(day)} style={{accentColor:'var(--primary-600)'}}/>
                  <span className="text-sm font-medium" style={{color:'var(--text-main)'}}>{day}</span>
                </label>
                <input type="time" className="form-input w-32" defaultValue="08:00"/>
                <span className="text-sm" style={{color:'var(--text-muted)'}}>to</span>
                <input type="time" className="form-input w-32" defaultValue="18:00"/>
              </div>
            ))}
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