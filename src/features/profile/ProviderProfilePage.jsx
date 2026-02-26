// src/features/profile/ProviderProfilePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Save, Upload, Trash2, FileText, Loader2, Eye, EyeOff } from 'lucide-react';
import { providerProfileAPI } from '../../api/profileService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { setProfileId } from '../../features/auth/authSlice';

const RES_TABS = ['Facility Info', 'Capacity & Rooms', 'Specializations'];
const AMB_TABS = ['Business Info', 'Service Area', 'Availability'];

const SPECIALIZATION_OPTIONS = [
  'DEMENTIA_CARE', 'PALLIATIVE_CARE', 'MEDICAL_TREATMENT', 'BASIC_NURSING',
  'MOBILITY_ASSISTANCE', 'REHABILITATION', 'MENTAL_HEALTH', 'WOUND_CARE',
];

const ROOM_TYPE_OPTIONS = ['SINGLE', 'DOUBLE', 'SUITE', 'DEMENTIA_UNIT', 'PALLIATIVE_WARD'];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const defaultAvailability = () =>
  DAYS.reduce((acc, day) => ({
    ...acc,
    [day]: {
      enabled: !['saturday', 'sunday'].includes(day),
      from: '08:00',
      to:   '18:00',
    },
  }), {});

/** Parse "08:00-18:00" → { enabled: true, from: '08:00', to: '18:00' } */
const parseAvailability = (apiAvail) => {
  const result = defaultAvailability();
  if (!apiAvail) return result;
  DAYS.forEach(day => {
    const val = apiAvail[day];
    if (val && typeof val === 'string') {
      const [from, to] = val.split('-');
      result[day] = { enabled: true, from: from ?? '08:00', to: to ?? '18:00' };
    } else {
      result[day] = { ...result[day], enabled: false };
    }
  });
  return result;
};

/** Convert UI availability state → API format */
const serializeAvailability = (avail) =>
  DAYS.reduce((acc, day) => {
    if (avail[day]?.enabled) acc[day] = `${avail[day].from}-${avail[day].to}`;
    return acc;
  }, {});

/** Parse API roomTypes map → UI state { SINGLE: '3', DOUBLE: '2', ... } */
const parseRoomTypes = (apiRooms) => {
  if (!apiRooms) return {};
  return Object.fromEntries(
    Object.entries(apiRooms).map(([k, v]) => [k, String(v)])
  );
};

/** Convert UI roomTypes → API format (only non-zero entries) */
const serializeRoomTypes = (roomCounts) =>
  Object.fromEntries(
    Object.entries(roomCounts)
      .filter(([, v]) => v && Number(v) > 0)
      .map(([k, v]) => [k, Number(v)])
  );

const defaultForm = {
  email:               '',   // read-only — pre-filled by backend
  facilityName:        '',
  address:             '',
  latitude:            '',
  longitude:           '',
  capacity:            '',
  availableRooms:      '',
  staffCount:          '',
  staffToPatientRatio: '',
  serviceRadius:       '',
  maxDailyPatients:    '',
  specializations:     [],
  isVisible:           true,
};

export default function ProviderProfilePage() {
  const { t }           = useTranslation();
  const { user }        = useAuth();
  const toast           = useToast();
  const dispatch        = useDispatch();
  const fileRef         = useRef();

  const isResidential   = user?.role === 'RESIDENTIAL_PROVIDER';
  const providerType    = isResidential ? 'RESIDENTIAL' : 'AMBULATORY';
  const TABS            = isResidential ? RES_TABS : AMB_TABS;

  const [tab,            setTab]            = useState(TABS[0]);
  const [form,           setForm]           = useState(defaultForm);
  const [roomCounts,     setRoomCounts]     = useState({});           // { SINGLE: '3', ... }
  const [avail,          setAvail]          = useState(defaultAvailability);
  const [profileId,      setLocalProfileId] = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [documents,      setDocuments]      = useState([]);
  const [uploading,      setUploading]      = useState(false);

  useEffect(() => { loadProfile(); }, []);

  // ─── Load ───────────────────────────────────────────────────────────────────
  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await providerProfileAPI.getMyProfile();
      const d   = res.data.data;
      setLocalProfileId(d.id);
      dispatch(setProfileId(d.id));
      setForm({
        email:               d.email              ?? '',
        facilityName:        d.facilityName        ?? '',
        address:             d.address             ?? '',
        latitude:            d.latitude            ?? '',
        longitude:           d.longitude           ?? '',
        capacity:            d.capacity            ?? '',
        availableRooms:      d.availableRooms      ?? '',
        staffCount:          d.staffCount          ?? '',
        staffToPatientRatio: d.staffToPatientRatio ?? '',
        serviceRadius:       d.serviceRadius       ?? '',
        maxDailyPatients:    d.maxDailyPatients     ?? '',
        specializations:     d.specializations     ?? [],
        isVisible:           d.isVisible           ?? true,
      });
      setRoomCounts(parseRoomTypes(d.roomTypes));
      setAvail(parseAvailability(d.availability));
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
    loadDocuments();
  };

  const loadDocuments = async () => {
    try {
      const res = await providerProfileAPI.getDocuments();
      setDocuments(res.data.data ?? []);
    } catch {
      // ignore
    }
  };

  // ─── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.specializations.length) {
      toast.warning('Please select at least one specialization');
      return;
    }

    setSaving(true);
    try {
      // email is managed by the identity service — never send it in the update payload
      const payload = {
        facilityName:        form.facilityName,
        providerType,
        address:             form.address,
        latitude:            form.latitude            !== '' ? Number(form.latitude)            : undefined,
        longitude:           form.longitude           !== '' ? Number(form.longitude)           : undefined,
        capacity:            form.capacity            !== '' ? Number(form.capacity)            : undefined,
        availableRooms:      form.availableRooms      !== '' ? Number(form.availableRooms)      : undefined,
        staffCount:          form.staffCount          !== '' ? Number(form.staffCount)          : undefined,
        staffToPatientRatio: form.staffToPatientRatio !== '' ? Number(form.staffToPatientRatio) : undefined,
        serviceRadius:       form.serviceRadius       !== '' ? Number(form.serviceRadius)       : undefined,
        maxDailyPatients:    form.maxDailyPatients    !== '' ? Number(form.maxDailyPatients)    : undefined,
        specializations:     form.specializations,
        roomTypes:           serializeRoomTypes(roomCounts),
        availability:        serializeAvailability(avail),
        isVisible:           form.isVisible,
      };

      const res = await providerProfileAPI.update(payload);
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
    fd.append('documentType', 'CERTIFICATION');
    setUploading(true);
    try {
      await providerProfileAPI.uploadDocument(fd);
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
      await providerProfileAPI.deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const toggleSpec = (spec) =>
    setForm(f => ({
      ...f,
      specializations: f.specializations.includes(spec)
        ? f.specializations.filter(s => s !== spec)
        : [...f.specializations, spec],
    }));

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const setAvailDay = (day, key, val) =>
    setAvail(prev => ({ ...prev, [day]: { ...prev[day], [key]: val } }));

  // ─── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary-600)' }} />
      </div>
    );
  }

  // ─── Shared: document section ────────────────────────────────────────────────
  const DocumentSection = () => (
    <div>
      <label className="form-label">Upload Certificates / Documents</label>
      <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
        className="hidden" onChange={handleFileUpload} />
      <div className="mt-1 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-primary-400"
        style={{ borderColor: 'var(--border)' }}
        onClick={() => fileRef.current?.click()}>
        {uploading
          ? <Loader2 size={24} className="mx-auto mb-2 animate-spin" style={{ color: 'var(--primary-600)' }} />
          : <Upload size={24} className="mx-auto mb-2" style={{ color: 'var(--text-faint)' }} />}
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {uploading ? 'Uploading...' : 'Upload accreditation and certifications'}
        </p>
      </div>

      {documents.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border"
              style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={16} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                <span className="text-sm truncate" style={{ color: 'var(--text-main)' }}>{doc.fileName}</span>
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
  );

  // ─── Shared: specializations ─────────────────────────────────────────────────
  const SpecializationsGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {SPECIALIZATION_OPTIONS.map(s => {
        const selected = form.specializations.includes(s);
        return (
          <label key={s}
            className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all"
            style={{ borderColor: selected ? 'var(--primary-400)' : 'var(--border)' }}>
            <input type="checkbox" style={{ accentColor: 'var(--primary-600)' }}
              checked={selected}
              onChange={() => toggleSpec(s)} />
            <span className="text-sm" style={{ color: 'var(--text-main)' }}>
              {s.replace(/_/g, ' ')}
            </span>
          </label>
        );
      })}
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--bg-page)' }}>
      <div className="mb-6 animate-fade-in-up">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-serif font-bold text-2xl" style={{ color: 'var(--text-main)' }}>
              {isResidential ? 'Residential' : 'Ambulatory'} Provider Profile
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Complete your profile to attract the best patient matches
            </p>
          </div>
          {profileId && (
            <button type="button"
              onClick={() => setField('isVisible', !form.isVisible)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
              style={{
                background:  form.isVisible ? 'var(--primary-50)'  : 'var(--bg-card)',
                borderColor: form.isVisible ? 'var(--primary-400)' : 'var(--border)',
                color:       form.isVisible ? 'var(--primary-700)' : 'var(--text-muted)',
              }}>
              {form.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
              {form.isVisible ? 'Visible' : 'Hidden'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap animate-fade-in-up delay-100">
        {TABS.map(tb => (
          <button key={tb} onClick={() => setTab(tb)}
            className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
            style={{
              background:  tab === tb ? 'var(--primary-600)' : 'var(--bg-card)',
              color:       tab === tb ? '#fff' : 'var(--text-muted)',
              borderColor: tab === tb ? 'var(--primary-600)' : 'var(--border)',
            }}>
            {tb}
          </button>
        ))}
      </div>

      <div className="animate-fade-in-up delay-200 p-6 rounded-2xl border max-w-2xl"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

        {/* ── RESIDENTIAL: Facility Info ── */}
        {isResidential && tab === 'Facility Info' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{ color: 'var(--text-main)' }}>Facility Information</h2>

            <div>
              <label className="form-label">Email</label>
              <input className="form-input opacity-70 cursor-not-allowed" readOnly disabled
                value={form.email} placeholder="Your registered email" />
              <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
                Email is managed by your account and cannot be changed here.
              </p>
            </div>

            <div>
              <label className="form-label">Facility Name</label>
              <input className="form-input" placeholder="e.g. Sonnengarten Pflegeheim"
                value={form.facilityName}
                onChange={e => setField('facilityName', e.target.value)} />
            </div>

            <div>
              <label className="form-label">Full Address</label>
              <textarea className="form-input" rows={2}
                placeholder="e.g. Musterstraße 1, 80331 Munich"
                value={form.address}
                onChange={e => setField('address', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Latitude</label>
                <input type="number" step="any" className="form-input" placeholder="e.g. 48.1351"
                  value={form.latitude}
                  onChange={e => setField('latitude', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Longitude</label>
                <input type="number" step="any" className="form-input" placeholder="e.g. 11.5820"
                  value={form.longitude}
                  onChange={e => setField('longitude', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* ── RESIDENTIAL: Capacity & Rooms ── */}
        {isResidential && tab === 'Capacity & Rooms' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{ color: 'var(--text-main)' }}>Capacity & Rooms</h2>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Capacity',        key: 'capacity',            ph: 'e.g. 80'  },
                { label: 'Available Rooms',        key: 'availableRooms',      ph: 'e.g. 12'  },
                { label: 'Staff Count',            key: 'staffCount',          ph: 'e.g. 45'  },
                { label: 'Staff-to-Patient Ratio', key: 'staffToPatientRatio', ph: 'e.g. 0.5' },
              ].map(f => (
                <div key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input type="number" step="any" className="form-input" placeholder={f.ph}
                    value={form[f.key]}
                    onChange={e => setField(f.key, e.target.value)} />
                </div>
              ))}
            </div>

            <div>
              <label className="form-label">Room Types & Counts</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {ROOM_TYPE_OPTIONS.map(rt => (
                  <div key={rt} className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ borderColor: 'var(--border)' }}>
                    <span className="text-sm flex-1" style={{ color: 'var(--text-main)' }}>
                      {rt.replace(/_/g, ' ')}
                    </span>
                    <input type="number" min={0} className="form-input w-20 text-center py-1"
                      placeholder="0"
                      value={roomCounts[rt] ?? ''}
                      onChange={e => setRoomCounts(prev => ({ ...prev, [rt]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RESIDENTIAL: Specializations ── */}
        {isResidential && tab === 'Specializations' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{ color: 'var(--text-main)' }}>Specializations</h2>
            <SpecializationsGrid />
            <DocumentSection />
          </div>
        )}

        {/* ── AMBULATORY: Business Info ── */}
        {!isResidential && tab === 'Business Info' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{ color: 'var(--text-main)' }}>Business Information</h2>

            <div>
              <label className="form-label">Email</label>
              <input className="form-input opacity-70 cursor-not-allowed" readOnly disabled
                value={form.email} placeholder="Your registered email" />
              <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
                Email is managed by your account and cannot be changed here.
              </p>
            </div>

            <div>
              <label className="form-label">Business Name</label>
              <input className="form-input" placeholder="e.g. Mobile Care Plus"
                value={form.facilityName}
                onChange={e => setField('facilityName', e.target.value)} />
            </div>

            <div>
              <label className="form-label">Address</label>
              <textarea className="form-input" rows={2}
                placeholder="e.g. Musterstraße 1, 80331 Munich"
                value={form.address}
                onChange={e => setField('address', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Latitude</label>
                <input type="number" step="any" className="form-input" placeholder="e.g. 48.1351"
                  value={form.latitude}
                  onChange={e => setField('latitude', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Longitude</label>
                <input type="number" step="any" className="form-input" placeholder="e.g. 11.5820"
                  value={form.longitude}
                  onChange={e => setField('longitude', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="form-label">Max Daily Patients</label>
              <input type="number" className="form-input" placeholder="e.g. 15"
                value={form.maxDailyPatients}
                onChange={e => setField('maxDailyPatients', e.target.value)} />
            </div>
          </div>
        )}

        {/* ── AMBULATORY: Service Area ── */}
        {!isResidential && tab === 'Service Area' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{ color: 'var(--text-main)' }}>Service Area</h2>

            <div>
              <label className="form-label">Service Radius (km)</label>
              <input type="number" className="form-input" placeholder="e.g. 20"
                value={form.serviceRadius}
                onChange={e => setField('serviceRadius', e.target.value)} />
            </div>

            <div>
              <label className="form-label">Specializations</label>
              <SpecializationsGrid />
            </div>

            <DocumentSection />
          </div>
        )}

        {/* ── AMBULATORY: Availability ── */}
        {!isResidential && tab === 'Availability' && (
          <div className="flex flex-col gap-5">
            <h2 className="font-serif font-bold text-lg" style={{ color: 'var(--text-main)' }}>Available Time Windows</h2>
            {DAYS.map(day => (
              <div key={day} className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 w-32 cursor-pointer">
                  <input type="checkbox" style={{ accentColor: 'var(--primary-600)' }}
                    checked={avail[day]?.enabled ?? false}
                    onChange={e => setAvailDay(day, 'enabled', e.target.checked)} />
                  <span className="text-sm font-medium capitalize" style={{ color: 'var(--text-main)' }}>{day}</span>
                </label>
                <input type="time" className="form-input w-32" disabled={!avail[day]?.enabled}
                  value={avail[day]?.from ?? '08:00'}
                  onChange={e => setAvailDay(day, 'from', e.target.value)} />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>to</span>
                <input type="time" className="form-input w-32" disabled={!avail[day]?.enabled}
                  value={avail[day]?.to ?? '18:00'}
                  onChange={e => setAvailDay(day, 'to', e.target.value)} />
              </div>
            ))}
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
