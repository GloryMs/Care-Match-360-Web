import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import Layout from '../components/layout/Layout';
import PublicLayout from '../components/layout/PublicLayout';

// Auth pages
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';
import VerifyEmailPage from '../features/auth/VerifyEmailPage';

// App pages
import DashboardPage from '../features/dashboard/DashboardPage';
import PatientProfilePage from '../features/profile/PatientProfilePage';
import ProviderProfilePage from '../features/profile/ProviderProfilePage';
import MatchesPage from '../features/matching/MatchesPage';
import OffersPage from '../features/matching/OffersPage';
import SubscriptionPage from '../features/billing/SubscriptionPage';
import InvoicesPage from '../features/billing/InvoicesPage';
import NotificationsPage from '../features/notifications/NotificationsPage';

function ProtectedRoute({ children }) {
  const token = useSelector((state) => state.auth.accessToken);
  return token ? children : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile/patient" element={<PatientProfilePage />} />
          <Route path="/profile/provider" element={<ProviderProfilePage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}