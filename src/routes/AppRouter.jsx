// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import Layout      from '../components/layout/Layout';
import PublicLayout from '../components/layout/PublicLayout';

// Landing
import LandingPage from '../features/landing/LandingPage';

// Auth pages
import LoginPage          from '../features/auth/LoginPage';
import RegisterPage       from '../features/auth/RegisterPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import ResetPasswordPage  from '../features/auth/ResetPasswordPage';
import VerifyEmailPage    from '../features/auth/VerifyEmailPage';

// App pages
import DashboardPage      from '../features/dashboard/DashboardPage';
import PatientProfilePage from '../features/profile/PatientProfilePage';
import ProviderProfilePage from '../features/profile/ProviderProfilePage';
import MatchesPage        from '../features/matching/MatchesPage';
import OffersPage         from '../features/matching/OffersPage';
import SubscriptionPage   from '../features/billing/SubscriptionPage';
import InvoicesPage       from '../features/billing/InvoicesPage';
import NotificationsPage  from '../features/notifications/NotificationsPage';

function ProtectedRoute({ children }) {
  const token = useSelector((s) => s.auth.accessToken);
  return token ? children : <Navigate to="/login" replace />;
}

function ProfileRouter() {
  const role = useSelector((s) => s.auth.user?.role);
  const isProvider = role === 'RESIDENTIAL_PROVIDER' || role === 'AMBULATORY_PROVIDER';
  return isProvider ? <ProviderProfilePage /> : <PatientProfilePage />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing — only for guests */}
        <Route path="/" element={<LandingPage />} />

        {/* Public auth routes */}
        <Route element={<PublicLayout />}>
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />
          <Route path="/verify-email"    element={<VerifyEmailPage />} />
        </Route>

        {/* Protected app routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard"      element={<DashboardPage />} />
          <Route path="/profile"        element={<ProfileRouter />} />
          <Route path="/matches"        element={<MatchesPage />} />
          <Route path="/offers"         element={<OffersPage />} />
          <Route path="/subscription"   element={<SubscriptionPage />} />
          <Route path="/invoices"       element={<InvoicesPage />} />
          <Route path="/notifications"  element={<NotificationsPage />} />
          {/* Placeholder for admin routes */}
          <Route path="/users"          element={<div className="p-8 font-serif text-xl" style={{color:'var(--text-main)'}}>Users Management — Coming Soon</div>} />
          <Route path="/analytics"      element={<div className="p-8 font-serif text-xl" style={{color:'var(--text-main)'}}>Analytics — Coming Soon</div>} />
          <Route path="/settings"       element={<div className="p-8 font-serif text-xl" style={{color:'var(--text-main)'}}>Settings — Coming Soon</div>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}