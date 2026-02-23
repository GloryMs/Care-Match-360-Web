// src/components/common/Badge.jsx
import { cn } from '../../utils/cn';

const colorMap = {
  green:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  blue:   'bg-[color:var(--primary-100)] text-[color:var(--primary-700)]',
  red:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  gray:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  primary:'bg-[color:var(--primary-100)] text-[color:var(--primary-700)]',
};

export default function Badge({ children, color = 'primary', className, dot }) {
  return (
    <span className={cn('badge', colorMap[color] || colorMap.primary, className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', `bg-current`)} />}
      {children}
    </span>
  );
}