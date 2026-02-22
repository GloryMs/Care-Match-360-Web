// src/components/common/LanguageSwitcher.jsx
import { useState, useRef, useEffect } from 'react';
import { useTranslation }              from 'react-i18next';
import { Globe, ChevronDown }          from 'lucide-react';
import { LANGUAGES }                   from '../../utils/constants';
import { cn }                          from '../../utils/cn';

export default function LanguageSwitcher({ compact = false, className }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen]  = useState(false);
  const ref              = useRef(null);

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const change = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('cm360_lang', code);
    setOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 font-medium transition-all duration-200 rounded-md px-2.5 py-1.5',
          'hover:bg-[color:var(--bg-subtle)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]',
          open && 'bg-[color:var(--bg-subtle)] text-[color:var(--text-main)]'
        )}
        aria-label={t('language.label')}
      >
        <Globe size={16} />
        {!compact && (
          <>
            <span className="text-sm">{current.flag} {current.nativeLabel}</span>
            <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
          </>
        )}
        {compact && <span className="text-sm">{current.flag}</span>}
      </button>

      {open && (
        <div
          className="absolute end-0 top-full mt-2 w-40 rounded-lg shadow-lg border z-50 overflow-hidden animate-fade-in"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => change(lang.code)}
              className={cn(
                'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors duration-150',
                'hover:bg-[color:var(--bg-subtle)] text-start',
                i18n.language === lang.code
                  ? 'font-bold text-[color:var(--primary-600)]'
                  : 'text-[color:var(--text-main)]'
              )}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.nativeLabel}</span>
              {i18n.language === lang.code && (
                <span className="ms-auto w-1.5 h-1.5 rounded-full bg-[color:var(--primary-500)]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}