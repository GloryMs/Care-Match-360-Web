// src/components/common/Select.jsx
import { forwardRef } from 'react';
import { cn }         from '../../utils/cn';

const Select = forwardRef(function Select(
  { label, error, children, className, wrapperClass, ...props },
  ref
) {
  return (
    <div className={cn('flex flex-col gap-1', wrapperClass)}>
      {label && <label className="field-label">{label}</label>}
      <select
        ref={ref}
        className={cn('input-base appearance-none cursor-pointer', error && '!border-red-400', className)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
});

export default Select;