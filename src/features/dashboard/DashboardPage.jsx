// src/features/dashboard/DashboardPage.jsx
import { useAuth }            from '../../hooks/useAuth';
import PatientDashboard       from './PatientDashboard';
import ProviderDashboard      from './ProviderDashboard';
import AdminDashboard         from './AdminDashboard';
import RelativeDashboard      from './RelativeDashboard';
import { USER_ROLES }         from '../../utils/constants';

export default function DashboardPage() {
  const { role } = useAuth();

  if (role === USER_ROLES.PATIENT)              return <PatientDashboard />;
  if (role === USER_ROLES.RELATIVE)             return <RelativeDashboard />;
  if (role === USER_ROLES.RESIDENTIAL_PROVIDER ||
      role === USER_ROLES.AMBULATORY_PROVIDER)  return <ProviderDashboard />;
  if (role === USER_ROLES.ADMIN ||
      role === USER_ROLES.SUPER_ADMIN)          return <AdminDashboard />;

  return (
    <div className="flex items-center justify-center h-64 text-[color:var(--text-muted)]">
      Unknown role: {role}
    </div>
  );
}