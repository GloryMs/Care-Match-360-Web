// src/components/layout/AppNavbar.jsx
import { Link }           from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector }    from 'react-redux';
import { Menu, Bell }     from 'lucide-react';
import LanguageSwitcher   from '../common/LanguageSwitcher';
import ThemeSwitcher      from '../common/ThemeSwitcher';

export default function AppNavbar({ onMenuClick }) {
  const { t }        = useTranslation();
  const unread       = useSelector((s) => s.notifications.unreadCount);

  return (
    <header
      className="h-16 flex items-center justify-between px-4 border-b flex-shrink-0"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Left: hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg hover:bg-[color:var(--bg-subtle)] transition"
        aria-label="Open menu"
      >
        <Menu size={20} style={{ color: 'var(--text-muted)' }} />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-1">
        <LanguageSwitcher compact />
        <ThemeSwitcher />

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-2.5 rounded-lg hover:bg-[color:var(--bg-subtle)] transition"
          aria-label={t('nav.notifications')}
        >
          <Bell size={18} style={{ color: 'var(--text-muted)' }} />
          {unread > 0 && (
            <span className="absolute top-1.5 end-1.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}