// src/components/common/Input.jsx
import { forwardRef } from 'react';
import { cn }         from '../../utils/cn';

const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, iconRight, type = 'text', className, wrapperClass, ...props },
  ref
) {
  return (
    <div className={cn('flex flex-col gap-1', wrapperClass)}>
      {label && <label className="field-label">{label}</label>}

      <div className="relative">
        {Icon && (
          <span className="absolute start-3 top-1/2 -translate-y-1/2 text-[color:var(--text-faint)]">
            <Icon size={16} />
          </span>
        )}

        <input
          ref={ref}
          type={type}
          className={cn(
            'input-base',
            Icon      && 'ps-10',
            iconRight && 'pe-10',
            error     && '!border-red-400 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.18)]',
            className
          )}
          {...props}
        />

        {iconRight && (
          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[color:var(--text-faint)]">
            {iconRight}
          </span>
        )}
      </div>

      {error && <p className="field-error">{error}</p>}
      {hint  && !error && <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{hint}</p>}
    </div>
  );
});

export default Input;