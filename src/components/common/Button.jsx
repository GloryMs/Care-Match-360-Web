// src/components/common/Button.jsx
import { cn } from '../../utils/cn';

const variants = {
  primary: 'btn-primary',
  ghost:   'btn-ghost',
  danger:  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-all duration-200',
  link:    'inline-flex items-center gap-1 text-[color:var(--primary-600)] font-semibold hover:underline underline-offset-2 transition',
};

const sizes = {
  sm:  'text-sm px-3 py-1.5',
  md:  '',
  lg:  'text-base px-6 py-3',
  xl:  'text-lg px-8 py-4',
};

export default function Button({
  children,
  variant = 'primary',
  size    = 'md',
  className,
  loading = false,
  disabled,
  fullWidth,
  ...props
}) {
  return (
    <button
      className={cn(
        variants[variant] || variants.primary,
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Loading…</span>
        </>
      ) : children}
    </button>
  );
}