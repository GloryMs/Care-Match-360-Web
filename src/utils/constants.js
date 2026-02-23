export const USER_ROLES = {
  PATIENT:               'PATIENT',
  RELATIVE:              'RELATIVE',
  RESIDENTIAL_PROVIDER:  'RESIDENTIAL_PROVIDER',
  AMBULATORY_PROVIDER:   'AMBULATORY_PROVIDER',
  ADMIN:                 'ADMIN',
  SUPER_ADMIN:           'SUPER_ADMIN',
};

export const PROVIDER_ROLES = [
  USER_ROLES.RESIDENTIAL_PROVIDER,
  USER_ROLES.AMBULATORY_PROVIDER,
];

export const ADMIN_ROLES = [
  USER_ROLES.ADMIN,
  USER_ROLES.SUPER_ADMIN,
];

export const OFFER_STATUS = {
  DRAFT:    'DRAFT',
  SENT:     'SENT',
  VIEWED:   'VIEWED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED:  'EXPIRED',
};

export const OFFER_STATUS_STYLES = {
  DRAFT:    { bg: 'bg-gray-100 dark:bg-gray-800',   text: 'text-gray-600 dark:text-gray-400'  },
  SENT:     { bg: 'bg-[color:var(--primary-100)]', text: 'text-[color:var(--primary-700)]'  },
  VIEWED:   { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
  ACCEPTED: { bg: 'bg-green-100 dark:bg-green-900/30',   text: 'text-green-700 dark:text-green-300'  },
  REJECTED: { bg: 'bg-red-100 dark:bg-red-900/30',   text: 'text-red-700 dark:text-red-300'   },
  EXPIRED:  { bg: 'bg-gray-200 dark:bg-gray-700',   text: 'text-gray-500'                     },
};

export const LANGUAGES = [
  { code: 'en', label: 'English',  nativeLabel: 'English',  dir: 'ltr', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch',  nativeLabel: 'Deutsch',  dir: 'ltr', flag: '🇩🇪' },
  { code: 'ar', label: 'Arabic',   nativeLabel: 'العربية',  dir: 'rtl', flag: '🇸🇦' },
];

export const SUBSCRIPTION_TIERS = {
  BASIC:   { label: 'Basic',   price: 49.99,  color: 'text-gray-600'  },
  PRO:     { label: 'Pro',     price: 99.99,  color: 'text-primary-600' },
  PREMIUM: { label: 'Premium', price: 199.99, color: 'text-amber-600' },
};

export const CARE_LEVELS = [1, 2, 3, 4, 5];