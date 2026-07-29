import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6">
        <div className="font-semibold text-slate-700">{t('app.name')}</div>
        <p>© {new Date().getFullYear()} {t('app.name')} — {t('app.tagline')}</p>
      </div>
    </footer>
  );
}
