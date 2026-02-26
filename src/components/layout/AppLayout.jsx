// src/components/layout/AppLayout.jsx
import { useState, useEffect }         from 'react';
import { Outlet, useNavigate }         from 'react-router-dom';
import { useDispatch }                 from 'react-redux';
import Sidebar                         from './Sidebar';
import AppNavbar                       from './AppNavbar';
import { useAuth }                     from '../../hooks/useAuth';
import { setProfileId }                from '../../features/auth/authSlice';
import { patientProfileAPI, providerProfileAPI } from '../../api/profileService';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { isProvider, isAuthenticated, profileId, user } = useAuth();

  // After login, resolve and store the profile UUID (patientId / providerId).
  // Also redirects to /profile when required fields are still null (incomplete profile).
  useEffect(() => {
    if (!isAuthenticated || profileId) return;
    if (ADMIN_ROLES.includes(user?.role)) return; // admins have no profile
    const api = isProvider ? providerProfileAPI : patientProfileAPI;
    api.getMyProfile()
      .then(r => {
        const profile = r.data.data;
        dispatch(setProfileId(profile.id));
        // Redirect to /profile if required fields are still null
        const incomplete = isProvider
          ? (!profile.facilityName || !profile.address)
          : (!profile.age || !profile.region);
        if (incomplete) {
          navigate('/profile', { replace: true });
        }
      })
      .catch(() => { /* profile fetch failed — user will complete it on the profile page */ });
  }, [isAuthenticated, isProvider, profileId, user?.role, dispatch, navigate]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-page)' }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <AppNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
