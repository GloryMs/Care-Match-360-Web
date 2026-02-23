// src/hooks/useAuth.js
import { useSelector } from 'react-redux';
import { ADMIN_ROLES, PROVIDER_ROLES, USER_ROLES } from '../utils/constants';

export const useAuth = () => {
  const { user, accessToken, loading, error, registered, registeredEmail } = useSelector((s) => s.auth);

  const isAuthenticated = !!accessToken && !!user;
  const role = user?.role || null;

  return {
    user,
    accessToken,
    loading,
    error,
    registered,
    registeredEmail,
    isAuthenticated,
    role,
    isPatient:   role === USER_ROLES.PATIENT,
    isRelative:  role === USER_ROLES.RELATIVE,
    isProvider:  PROVIDER_ROLES.includes(role),
    isAdmin:     ADMIN_ROLES.includes(role),
    isSuperAdmin:role === USER_ROLES.SUPER_ADMIN,
  };
};