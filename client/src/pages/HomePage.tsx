import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDays, PlusCircle, Search, Ticket, Users } from 'lucide-react';
import { api } from '../lib/api';
import type { Category, EventItem, PagedResult } from '../types';
import EventCard from '../components/EventCard';
import Spinner from '../components/Spinner';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<PagedResult<EventItem>>('/events', { params: { sortBy: 'newest', pageSize: 8 } }),
      api.get<Category[]>('/categories'),
    ])
      .then(([eventsRes, categoriesRes]) => {
        setEvents(eventsRes.data.items);
        setCategories(categoriesRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/events${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  }

  const features = [
    { icon: CalendarDays, title: t('home.feature1Title'), text: t('home.feature1Text') },
    { icon: Ticket, title: t('home.feature2Title'), text: t('home.feature2Text') },
    { icon: Users, title: t('home.feature3Title'), text: t('home.feature3Text') },
  ];

  return (
    <div>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <span className="mb-4 inline-block text-sm font-medium text-purple-700">{t('home.badge')}</span>
          <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">{t('home.title')}</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-500">{t('home.subtitle')}</p>

          <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-lg gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('home.searchPlaceholder')}
                className="w-full rounded-lg border border-slate-200 bg-white py-3 ps-10 pe-4 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700"
            >
              {t('home.searchButton')}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/events" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-purple-300 hover:text-purple-700">
              {t('home.browseAll')}
            </Link>
            <Link to="/events/new" className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">
              <PlusCircle size={16} /> {t('home.publishEvent')}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {features.map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-xl border border-slate-200 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                <item.icon size={18} />
              </span>
              <div>
                <h3 className="font-semibold text-slate-800">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('home.browseByCategory')}</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/events?categoryId=${c.id}`}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-purple-300 hover:text-purple-700"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">{t('home.latestEvents')}</h2>
          <Link to="/events" className="text-sm font-medium text-purple-700 hover:underline">
            {t('common.viewAll')}
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
            {t('home.noEvents')}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
