// src/components/layout/AuthLayout.jsx
import { Link }          from 'react-router-dom';
import { Heart }         from 'lucide-react';
import { useTranslation} from 'react-i18next';
import LanguageSwitcher  from '../common/LanguageSwitcher';
import ThemeSwitcher     from '../common/ThemeSwitcher';

export default function AuthLayout({ children, illustrationSlot }) {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-page)' }}
    >
      {/* Top bar */}
      <header
        className="border-b h-14 flex items-center px-6 justify-between"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <Link to="/" className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'var(--primary-600)' }}
          >
            <Heart size={14} className="text-white" />
          </span>
          <span className="font-serif font-bold text-base" style={{ color: 'var(--text-main)' }}>
            Care<span style={{ color: 'var(--primary-600)' }}>Match</span>360
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs" style={{ color: 'var(--text-faint)' }}>
        {t('common.copyRight')}
      </footer>
    </div>
  );
}