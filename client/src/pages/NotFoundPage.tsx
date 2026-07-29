import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-3xl font-bold text-slate-800">{t('notFound.title')}</h1>
      <p className="text-slate-500">{t('notFound.message')}</p>
      <Link to="/" className="mt-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700">
        {t('notFound.backHome')}
      </Link>
    </div>
  );
}
