// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import Layout       from '../components/layout/Layout';
import PublicLayout from '../components/layout/PublicLayout';

// Landing
import LandingPage from '../features/landing/LandingPage';

// Auth pages
import LoginPage          from '../features/auth/LoginPage';
import RegisterPage       from '../features/auth/RegisterPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import ResetPasswordPage  from '../features/auth/ResetPasswordPage';
import VerifyEmailPage    from '../features/auth/VerifyEmailPage';

// App pages — shared
import DashboardPage      from '../features/dashboard/DashboardPage';
import NotificationsPage  from '../features/notifications/NotificationsPage';

// Profile pages
import PatientProfilePage  from '../features/profile/PatientProfilePage';
import ProviderProfilePage from '../features/profile/ProviderProfilePage';

// Patient / Relative pages
import MatchesPage       from '../features/matching/MatchesPage';
import OffersPage        from '../features/matching/OffersPage';
import SubscriptionPage  from '../features/billing/SubscriptionPage';
import InvoicesPage      from '../features/billing/InvoicesPage';

// Provider pages (real API)
import ProviderMatchesPage      from '../features/matching/ProviderMatchesPage';
import ProviderOffersPage       from '../features/matching/ProviderOffersPage';
import ProviderSubscriptionPage from '../features/billing/ProviderSubscriptionPage';
import ProviderInvoicesPage     from '../features/billing/ProviderInvoicesPage';

const PROVIDER_ROLES = ['RESIDENTIAL_PROVIDER', 'AMBULATORY_PROVIDER'];

function ProtectedRoute({ children }) {
  const token = useSelector((s) => s.auth.accessToken);
  return token ? children : <Navigate to="/login" replace />;
}

function ProfileRouter() {
  const role = useSelector((s) => s.auth.user?.role);
  return PROVIDER_ROLES.includes(role) ? <ProviderProfilePage /> : <PatientProfilePage />;
}

function MatchesRouter() {
  const role = useSelector((s) => s.auth.user?.role);
  return PROVIDER_ROLES.includes(role) ? <ProviderMatchesPage /> : <MatchesPage />;
}

function OffersRouter() {
  const role = useSelector((s) => s.auth.user?.role);
  return PROVIDER_ROLES.includes(role) ? <ProviderOffersPage /> : <OffersPage />;
}

function SubscriptionRouter() {
  const role = useSelector((s) => s.auth.user?.role);
  return PROVIDER_ROLES.includes(role) ? <ProviderSubscriptionPage /> : <SubscriptionPage />;
}

function InvoicesRouter() {
  const role = useSelector((s) => s.auth.user?.role);
  return PROVIDER_ROLES.includes(role) ? <ProviderInvoicesPage /> : <InvoicesPage />;
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
          <Route path="/dashboard"     element={<DashboardPage />} />
          <Route path="/profile"       element={<ProfileRouter />} />
          <Route path="/matches"       element={<MatchesRouter />} />
          <Route path="/offers"        element={<OffersRouter />} />
          <Route path="/subscription"  element={<SubscriptionRouter />} />
          <Route path="/invoices"      element={<InvoicesRouter />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          {/* Admin placeholders */}
          <Route path="/users"
            element={<div className="p-8 font-serif text-xl" style={{color:'var(--text-main)'}}>Users Management — Coming Soon</div>} />
          <Route path="/analytics"
            element={<div className="p-8 font-serif text-xl" style={{color:'var(--text-main)'}}>Analytics — Coming Soon</div>} />
          <Route path="/settings"
            element={<div className="p-8 font-serif text-xl" style={{color:'var(--text-main)'}}>Settings — Coming Soon</div>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}