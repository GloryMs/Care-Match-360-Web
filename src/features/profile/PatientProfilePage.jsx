// src/features/profile/PatientProfilePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { User, Heart, Shield, Save, Upload, Trash2, FileText, Loader2 } from 'lucide-react';
import { patientProfileAPI } from '../../api/profileService';
import { useToast } from '../../hooks/useToast';
import { setProfileId } from '../../features/auth/authSlice';

const TABS = [
  { id: 'basic',   label: 'Basic Info',   icon: User   },
  { id: 'care',    label: 'Care Needs',   icon: Heart  },
  { id: 'medical', label: 'Medical Info', icon: Shield },
];

const CARE_TYPE_OPTIONS = ['RESIDENTIAL', 'AMBULATORY', 'DEMENTIA_CARE', 'PALLIATIVE_CARE'];

const MEDICAL_SERVICES = [
  'Basic nursing care', 'Medical treatment care', 'Dementia support',
  'Palliative care', 'Mobility assistance', 'Wound care',
  'Medication management', 'Physical therapy',
];

const DEFAULT_LIFESTYLE = { mobilityLevel: 'Fully mobile', socialPreference: 'Moderate' };
const DEFAULT_MEDICAL   = { services: [], notes: '' };

const defaultForm = {
  email:                '',   // read-only — pre-filled by backend
  age:                  '',
  gender:               'male',
  region:               '',
  latitude:             '',
  longitude:            '',
  careLevel:            1,
  careType:             [],
  lifestyleAttributes:  { ...DEFAULT_LIFESTYLE },
  medicalRequirements:  { ...DEFAULT_MEDICAL },
  dataVisibility:       {},
  consentGiven:         false,
};

export default function PatientProfilePage() {
  const { t }    = useTranslation();
  const toast    = useToast();
  const dispatch = useDispatch();
  const fileRef  = useRef();

  const [tab,            setTab]            = useState('basic');
  const [form,           setForm]           = useState(defaultForm);
  const [profileId,      setLocalProfileId] = useState(null);   // null = create mode
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [documents,      setDocuments]      = useState([]);
  const [uploading,      setUploading]      = useState(false);

  useEffect(() => { loadProfile(); }, []);

  // ─── Load ───────────────────────────────────────────────────────────────────
  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await patientProfileAPI.getMyProfile();
      const d   = res.data.data;
      setLocalProfileId(d.id);
      dispatch(setProfileId(d.id));
      setForm({
        email:               d.email              ?? '',
        age:                 d.age                ?? '',
        gender:              d.gender             ?? 'male',
        region:              d.region             ?? '',
        latitude:            d.latitude           ?? '',
        longitude:           d.longitude          ?? '',
        careLevel:           d.careLevel          ?? 1,
        careType:            d.careType           ?? [],
        lifestyleAttributes: d.lifestyleAttributes ?? { ...DEFAULT_LIFESTYLE },
        medicalRequirements: d.medicalRequirements ?? { ...DEFAULT_MEDICAL },
        dataVisibility:      d.dataVisibility      ?? {},
        consentGiven:        d.consentGiven        ?? false,
      });
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error('Failed to load profile');
      }
      // 404 = profile not yet initialised (edge case)
    } finally {
      setLoading(false);
    }
    loadDocuments();
  };

  const loadDocuments = async () => {
    try {
      const res = await patientProfileAPI.getDocuments();
      setDocuments(res.data.data ?? []);
    } catch {
      // silently ignore — documents section is optional
    }
  };

  // ─── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.consentGiven) {
      toast.warning('Please give consent to data processing before saving');
      return;
    }
    if (!form.careType.length) {
      toast.warning('Please select at least one care type');
      return;
    }

    setSaving(true);
    try {
      // email is managed by the identity service — never send it in the update payload
      const { email: _email, ...rest } = form;
      const payload = {
        ...rest,
        age:       Number(form.age),
        latitude:  form.latitude  !== '' ? Number(form.latitude)  : undefined,
        longitude: form.longitude !== '' ? Number(form.longitude) : undefined,
      };

      const res = await patientProfileAPI.update(payload);
      const savedId = res.data.data?.id;
      if (savedId && !profileId) {
        setLocalProfileId(savedId);
        dispatch(setProfileId(savedId));
      }
      toast.success('Profile saved successfully');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to save profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── Documents ──────────────────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);
    fd.append('documentType', 'MEDICAL_REPORT');

    setUploading(true);
    try {
      await patientProfileAPI.uploadDocument(fd);
      toast.success('Document uploaded');
      await loadDocuments();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await patientProfileAPI.deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const toggleCareType = (type) =>
    setForm(f => ({
      ...f,
      careType: f.careType.includes(type)
        ? f.careType.filter(t => t !== type)
        : [...f.careType, type],
    }));

  const toggleMedicalService = (service) => {
    const services = form.medicalRequirements.services ?? [];
    setForm(f => ({
      ...f,
      medicalRequirements: {
        ...f.medicalRequirements,
        services: services.includes(service)
          ? services.filter(s => s !== service)
          : [...services, service],
      },
    }));
  };

  const setLifestyle = (key, val) =>
    setForm(f => ({ ...f, lifestyleAttributes: { ...f.lifestyleAttributes, [key]: val } }));

  const setMedical = (key, val) =>
    setForm(f => ({ ...f, medicalRequirements: { ...f.medicalRequirements, [key]: val } }));

  // ─── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary-600)' }} />
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--bg-page)' }}>
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-serif font-bold text-2xl" style={{ color: 'var(--text-main)' }}>Patient Profile</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Complete your profile to get the best care provider matches
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap animate-fade-in-up delay-100">
        {TABS.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
            style={{
              background:  tab === tb.id ? 'var(--primary-600)' : 'var(--bg-card)',
              color:       tab === tb.id ? '#fff' : 'var(--text-muted)',
              borderColor: tab === tb.id ? 'var(--primary-600)' : 'var(--border)',
            }}>
            <tb.icon size={15} /> {tb.label}
          </button>
        ))}
      </div>

      {/* Form card */}
      <div className="animate-fade-in-up delay-200 p-6 rounded-2xl border max-w-2xl"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

        {/* ── Basic Info ── */}
        {tab === 'basic' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{ color: 'var(--text-main)' }}>Basic Information</h2>

            <div>
              <label className="form-label">Email</label>
              <input className="form-input opacity-70 cursor-not-allowed" readOnly disabled
                value={form.email}
                placeholder="Your registered email" />
              <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
                Email is managed by your account and cannot be changed here.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Age</label>
                <input type="number" className="form-input" placeholder="e.g. 72" min={0} max={150}
                  value={form.age}
                  onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Gender</label>
                <select className="form-input" value={form.gender}
                  onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Region</label>
              <input className="form-input" placeholder="e.g. Bavaria"
                value={form.region}
                onChange={e => setForm(f => ({ ...f, region: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Latitude</label>
                <input type="number" step="any" className="form-input" placeholder="e.g. 48.1351"
                  value={form.latitude}
                  onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Longitude</label>
                <input type="number" step="any" className="form-input" placeholder="e.g. 11.5820"
                  value={form.longitude}
                  onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" style={{ accentColor: 'var(--primary-600)' }}
                checked={form.consentGiven}
                onChange={e => setForm(f => ({ ...f, consentGiven: e.target.checked }))} />
              <span className="text-sm" style={{ color: 'var(--text-main)' }}>
                I consent to data processing for care matching purposes
              </span>
            </label>
          </div>
        )}

        {/* ── Care Needs ── */}
        {tab === 'care' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{ color: 'var(--text-main)' }}>Care Needs</h2>

            <div>
              <label className="form-label">Care Level (Pflegegrad)</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {[1, 2, 3, 4, 5].map(l => (
                  <button key={l} type="button" onClick={() => setForm(f => ({ ...f, careLevel: l }))}
                    className="w-12 h-12 rounded-xl border-2 font-bold text-lg transition-all hover:scale-105"
                    style={{
                      borderColor: form.careLevel === l ? 'var(--primary-500)' : 'var(--border)',
                      background:  form.careLevel === l ? 'var(--primary-50)'  : 'var(--bg-card)',
                      color:       form.careLevel === l ? 'var(--primary-700)' : 'var(--text-muted)',
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Care Type Required</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {CARE_TYPE_OPTIONS.map(type => (
                  <button key={type} type="button" onClick={() => toggleCareType(type)}
                    className="px-4 py-2 rounded-xl border text-sm font-semibold transition-all"
                    style={{
                      borderColor: form.careType.includes(type) ? 'var(--primary-500)' : 'var(--border)',
                      background:  form.careType.includes(type) ? 'var(--primary-50)'  : 'var(--bg-card)',
                      color:       form.careType.includes(type) ? 'var(--primary-700)' : 'var(--text-muted)',
                    }}>
                    {type.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Mobility Level</label>
              <select className="form-input"
                value={form.lifestyleAttributes.mobilityLevel ?? 'Fully mobile'}
                onChange={e => setLifestyle('mobilityLevel', e.target.value)}>
                <option>Fully mobile</option>
                <option>Partially mobile</option>
                <option>Wheelchair</option>
                <option>Bedridden</option>
              </select>
            </div>

            <div>
              <label className="form-label">Social Interaction Preference</label>
              <select className="form-input"
                value={form.lifestyleAttributes.socialPreference ?? 'Moderate'}
                onChange={e => setLifestyle('socialPreference', e.target.value)}>
                <option>Very social</option>
                <option>Moderate</option>
                <option>Quiet / private</option>
              </select>
            </div>
          </div>
        )}

        {/* ── Medical Info ── */}
        {tab === 'medical' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{ color: 'var(--text-main)' }}>Medical Requirements</h2>

            <div>
              <label className="form-label">Required Medical Services</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {MEDICAL_SERVICES.map(s => {
                  const selected = (form.medicalRequirements.services ?? []).includes(s);
                  return (
                    <label key={s}
                      className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all"
                      style={{ borderColor: selected ? 'var(--primary-400)' : 'var(--border)' }}>
                      <input type="checkbox" style={{ accentColor: 'var(--primary-600)' }}
                        checked={selected}
                        onChange={() => toggleMedicalService(s)} />
                      <span className="text-sm" style={{ color: 'var(--text-main)' }}>{s}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="form-label">Additional Medical Notes</label>
              <textarea className="form-input" rows={4}
                placeholder="Describe any specific medical conditions or requirements..."
                value={form.medicalRequirements.notes ?? ''}
                onChange={e => setMedical('notes', e.target.value)} />
            </div>

            <div>
              <label className="form-label">Upload Documents (optional)</label>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                className="hidden" onChange={handleFileUpload} />
              <div className="mt-1 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-primary-400"
                style={{ borderColor: 'var(--border)' }}
                onClick={() => fileRef.current?.click()}>
                {uploading
                  ? <Loader2 size={24} className="mx-auto mb-2 animate-spin" style={{ color: 'var(--primary-600)' }} />
                  : <Upload size={24} className="mx-auto mb-2" style={{ color: 'var(--text-faint)' }} />}
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {uploading ? 'Uploading...' : 'Click to upload medical documents'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>PDF, JPG, PNG up to 10MB</p>
              </div>

              {documents.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border"
                      style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={16} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                        <span className="text-sm truncate" style={{ color: 'var(--text-main)' }}>
                          {doc.fileName}
                        </span>
                      </div>
                      <button type="button" onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-50 ml-2" style={{ flexShrink: 0 }}>
                        <Trash2 size={14} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="mt-6 pt-4 border-t flex justify-end" style={{ borderColor: 'var(--border)' }}>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'var(--primary-600)' }}>
            {saving
              ? <Loader2 size={15} className="animate-spin" />
              : <Save size={15} />}
            {saving ? 'Saving...' : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
