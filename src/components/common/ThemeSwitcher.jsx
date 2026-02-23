// src/components/common/ThemeSwitcher.jsx
import { useState, useRef, useEffect } from 'react';
import { useTranslation }              from 'react-i18next';
import { Moon, Sun, Palette, Check }   from 'lucide-react';
import { useTheme }                    from '../../hooks/useTheme';
import { cn }                          from '../../utils/cn';

export default function ThemeSwitcher({ className }) {
  const { t }                          = useTranslation();
  const { isDark, colorScheme, toggleDark, setColor } = useTheme();
  const [open, setOpen]                = useState(false);
  const ref                            = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-all',
          'hover:bg-[color:var(--bg-subtle)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]',
          open && 'bg-[color:var(--bg-subtle)]'
        )}
        aria-label="Theme settings"
      >
        <Palette size={16} />
      </button>

      {open && (
        <div
          className="absolute end-0 top-full mt-2 w-48 rounded-lg shadow-lg border z-50 overflow-hidden animate-fade-in p-2 flex flex-col gap-1"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          {/* Dark / Light toggle */}
          <button
            onClick={() => { toggleDark(); }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors hover:bg-[color:var(--bg-subtle)] text-[color:var(--text-main)]"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span className="font-medium">{isDark ? t('theme.light') : t('theme.dark')}</span>
          </button>

          <div className="h-px mx-2" style={{ background: 'var(--border)' }} />

          {/* Color: green */}
          <button
            onClick={() => { setColor('green'); setOpen(false); }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors hover:bg-[color:var(--bg-subtle)] text-[color:var(--text-main)]"
          >
            <span className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0" />
            <span className="font-medium flex-1 text-start">{t('theme.green')}</span>
            {colorScheme === 'green' && <Check size={14} className="text-[color:var(--primary-600)]" />}
          </button>

          {/* Color: blue */}
          <button
            onClick={() => { setColor('blue'); setOpen(false); }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors hover:bg-[color:var(--bg-subtle)] text-[color:var(--text-main)]"
          >
            <span className="w-4 h-4 rounded-full flex-shrink-0" style={{background:"#5A8FA0"}} />
            <span className="font-medium flex-1 text-start">{t('theme.blue')}</span>
            {colorScheme === 'blue' && <Check size={14} className="text-[color:var(--primary-600)]" />}
          </button>
        </div>
      )}
    </div>
  );
}