// src/components/layout/Sidebar.jsx
import { NavLink }       from 'react-router-dom';
import { useTranslation} from 'react-i18next';
import { useDispatch }   from 'react-redux';
import {
  LayoutDashboard, User, Sparkles, FileText,
  CreditCard, Receipt, Bell, Settings,
  LogOut, Heart, X, Users, BarChart3,
} from 'lucide-react';

import { logout }   from '../../features/auth/authSlice';
import { useAuth }  from '../../hooks/useAuth';
import { ADMIN_ROLES, PROVIDER_ROLES, USER_ROLES } from '../../utils/constants';
import { cn }       from '../../utils/cn';

const linkBase =
  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150';

const activeStyle = {
  background: 'var(--primary-100)',
  color:      'var(--primary-700)',
  fontWeight: 600,
};

function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(linkBase, isActive ? '' : 'hover:bg-[color:var(--bg-subtle)]')
      }
      style={({ isActive }) =>
        isActive ? activeStyle : { color: 'var(--text-muted)' }
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  const { t }    = useTranslation();
  const dispatch = useDispatch();
  const { user, isProvider, isAdmin } = useAuth();

  const providerLinks = PROVIDER_ROLES.includes(user?.role);
  const adminLinks    = ADMIN_ROLES.includes(user?.role);
  const patientLinks  = [USER_ROLES.PATIENT, USER_ROLES.RELATIVE].includes(user?.role);

  return (
    <aside
      className={cn(
        'fixed md:static inset-y-0 start-0 z-30 flex flex-col w-60 border-e transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
      style={{
        background:    'var(--bg-card)',
        borderColor:   'var(--border)',
        minHeight:     '100vh',
      }}
    >
      {/* Header */}
      <div
        className="h-16 flex items-center justify-between px-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--primary-600)' }}
          >
            <Heart size={16} className="text-white" />
          </span>
          <span className="font-serif font-bold text-sm" style={{ color: 'var(--text-main)' }}>
            Care<span style={{ color: 'var(--primary-600)' }}>Match</span>360
          </span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]"
        >
          <X size={18} />
        </button>
      </div>

      {/* User chip */}
      {user && (
        <div className="px-3 pt-4 pb-2">
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
            style={{ background: 'var(--bg-subtle)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
              style={{ background: 'var(--primary-600)' }}
            >
              {user.email[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: 'var(--text-main)' }}>
                {user.email}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--primary-600)' }}>
                {user.role.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
        <NavItem to="/dashboard" icon={LayoutDashboard} label={t('nav.dashboard')} end />

        {/* Patient / Relative */}
        {patientLinks && (
          <>
            <NavItem to="/profile"      icon={User}      label={t('nav.profile')} />
            <NavItem to="/matches"      icon={Sparkles}  label={t('nav.matches')} />
            <NavItem to="/offers"       icon={FileText}  label={t('nav.offers')} />
          </>
        )}

        {/* Provider */}
        {providerLinks && (
          <>
            <NavItem to="/profile"      icon={User}       label={t('nav.profile')} />
            <NavItem to="/matches"      icon={Sparkles}   label={t('nav.matches')} />
            <NavItem to="/offers"       icon={FileText}   label={t('nav.offers')} />
            <NavItem to="/subscription" icon={CreditCard} label={t('nav.subscription')} />
            <NavItem to="/invoices"     icon={Receipt}    label={t('nav.invoices')} />
          </>
        )}

        {/* Admin */}
        {adminLinks && (
          <>
            <NavItem to="/users"        icon={Users}      label="Users" />
            <NavItem to="/analytics"    icon={BarChart3}  label="Analytics" />
            <NavItem to="/subscription" icon={CreditCard} label={t('nav.subscription')} />
          </>
        )}

        <div className="flex-1" />

        {/* Bottom items */}
        <div className="border-t pt-2 mt-2 flex flex-col gap-1" style={{ borderColor: 'var(--border)' }}>
          <NavItem to="/notifications" icon={Bell}     label={t('nav.notifications')} />
          <NavItem to="/settings"      icon={Settings} label={t('nav.settings')} />

          <button
            onClick={() => dispatch(logout())}
            className={cn(
              linkBase,
              'w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mt-1'
            )}
          >
            <LogOut size={18} />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}