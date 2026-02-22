// src/components/layout/PublicLayout.jsx
//
// Wraps public/auth pages (Login, Register, Forgot Password, etc.).
// Shows a minimal top bar with logo + language/theme switchers.
// The <Outlet /> renders the auth page content centered on screen.

import { Outlet, Link } from 'react-router-dom';
import { Heart }        from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher';
import ThemeSwitcher    from '../common/ThemeSwitcher';

export default function PublicLayout() {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-page)' }}
    >
      {/* ── Top bar ── */}
      <header
        className="h-14 flex items-center justify-between px-6 border-b flex-shrink-0"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--primary-600)' }}
          >
            <Heart size={14} className="text-white" />
          </span>
          <span
            className="font-serif font-bold text-base"
            style={{ color: 'var(--text-main)' }}
          >
            Care<span style={{ color: 'var(--primary-600)' }}>Match</span>360
          </span>
        </Link>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      {/* ── Auth page content ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="py-4 text-center text-xs"
        style={{ color: 'var(--text-faint)' }}
      >
        © 2026 CareMatch360. All rights reserved.
      </footer>
    </div>
  );
}