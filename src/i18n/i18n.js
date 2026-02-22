import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'de', 'ar'],
    defaultNS: 'translation',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'cm360_lang',
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
  });

// Apply RTL and font whenever language changes
const applyLangDirection = (lng) => {
  const isRTL = lng === 'ar';
  document.documentElement.dir  = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;

  if (isRTL) {
    // Load Cairo font dynamically if not already present
    if (!document.getElementById('font-arabic')) {
      const link  = document.createElement('link');
      link.id     = 'font-arabic';
      link.rel    = 'stylesheet';
      link.href   =
        'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  }
};

i18n.on('languageChanged', applyLangDirection);

// Apply on initial load
if (i18n.isInitialized) {
  applyLangDirection(i18n.language);
} else {
  i18n.on('initialized', () => applyLangDirection(i18n.language));
}

export default i18n;