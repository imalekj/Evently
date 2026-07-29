import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';

export const LANG_KEY = 'evently_lang';
export type SupportedLang = 'ar' | 'en';

function getInitialLang(): SupportedLang {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored === 'ar' || stored === 'en') return stored;
  return 'ar';
}

export const initialLang = getInitialLang();

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: initialLang,
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
});

export function applyDocumentDirection(lang: SupportedLang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

applyDocumentDirection(initialLang);

export default i18n;
