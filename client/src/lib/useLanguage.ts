import { useTranslation } from 'react-i18next';
import { applyDocumentDirection, LANG_KEY, type SupportedLang } from '../i18n';

export function useLanguage() {
  const { i18n } = useTranslation();
  const lang = (i18n.language as SupportedLang) || 'ar';

  function setLang(next: SupportedLang) {
    i18n.changeLanguage(next);
    localStorage.setItem(LANG_KEY, next);
    applyDocumentDirection(next);
  }

  function toggleLang() {
    setLang(lang === 'ar' ? 'en' : 'ar');
  }

  return { lang, setLang, toggleLang, isRtl: lang === 'ar' };
}
