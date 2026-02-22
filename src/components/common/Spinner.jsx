// src/components/common/Spinner.jsx
import { cn } from '../../utils/cn';

export default function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3' };
  return (
    <span
      className={cn(
        'inline-block rounded-full border-[color:var(--border)] border-t-[color:var(--primary-500)] animate-spin',
        sizes[size] || sizes.md,
        className
      )}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p style={{ color: 'var(--text-muted)' }} className="text-sm font-medium animate-pulse">
          Loading…
        </p>
      </div>
    </div>
  );
}