import type { SupportedLang } from '../i18n';

function locale(lang: SupportedLang): string {
  return lang === 'ar' ? 'ar-EG' : 'en-US';
}

export function formatDate(dateStr: string, lang: SupportedLang): string {
  return new Date(dateStr).toLocaleDateString(locale(lang), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string, lang: SupportedLang): string {
  return new Date(dateStr).toLocaleString(locale(lang), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatPrice(price: number, lang: SupportedLang): string {
  if (price === 0) return lang === 'ar' ? 'مجاني' : 'Free';
  return `${price.toLocaleString(locale(lang))} $`;
}
