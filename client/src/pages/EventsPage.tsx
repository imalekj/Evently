import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';
import type { Category, EventItem, PagedResult } from '../types';
import EventCard from '../components/EventCard';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500';

export default function EventsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [result, setResult] = useState<PagedResult<EventItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const SORT_OPTIONS = [
    { value: 'date', label: t('events.sortDate') },
    { value: 'newest', label: t('events.sortNewest') },
    { value: 'price_asc', label: t('events.sortPriceAsc') },
    { value: 'price_desc', label: t('events.sortPriceDesc') },
  ];

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const location = searchParams.get('location') || '';
  const fromDate = searchParams.get('fromDate') || '';
  const toDate = searchParams.get('toDate') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sortBy') || 'date';
  const page = Number(searchParams.get('page') || '1');

  useEffect(() => {
    api.get<Category[]>('/categories').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params: Record<string, string> = { sortBy, page: String(page), pageSize: '12' };
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;
    if (location) params.location = location;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    api
      .get<PagedResult<EventItem>>('/events', { params })
      .then((res) => setResult(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [search, categoryId, location, fromDate, toDate, minPrice, maxPrice, sortBy, page]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams({});
  }

  const activeFilterCount = [categoryId, location, fromDate, toDate, minPrice, maxPrice].filter(Boolean).length;
  const totalPages = result ? Math.max(1, Math.ceil(result.totalCount / result.pageSize)) : 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4">
        <h1 className="text-xl font-bold text-slate-800">{t('events.title')}</h1>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              placeholder={t('events.searchPlaceholder')}
              className={`${inputClass} ps-10`}
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-purple-300"
          >
            <SlidersHorizontal size={16} />
            {t('events.filters')}
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          <select value={sortBy} onChange={(e) => updateParam('sortBy', e.target.value)} className={inputClass}>
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">{t('events.category')}</label>
              <select value={categoryId} onChange={(e) => updateParam('categoryId', e.target.value)} className={inputClass}>
                <option value="">{t('events.allCategories')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">{t('events.location')}</label>
              <input
                value={location}
                onChange={(e) => updateParam('location', e.target.value)}
                placeholder={t('events.locationPlaceholder')}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">{t('events.fromDate')}</label>
              <input type="date" value={fromDate} onChange={(e) => updateParam('fromDate', e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">{t('events.toDate')}</label>
              <input type="date" value={toDate} onChange={(e) => updateParam('toDate', e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">{t('events.minPrice')}</label>
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => updateParam('minPrice', e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">{t('events.maxPrice')}</label>
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                placeholder={t('events.anyPrice')}
                className={inputClass}
              />
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-2">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <X size={14} /> {t('events.clearFilters')}
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && <Spinner />}

      {!loading && error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center text-red-600">{error}</div>
      )}

      {!loading && !error && result && result.items.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <Filter className="text-slate-300" size={36} />
          <p className="font-medium text-slate-600">{t('events.noResults')}</p>
          <button onClick={clearFilters} className="text-sm font-medium text-purple-700 hover:underline">
            {t('events.clearAndRetry')}
          </button>
        </div>
      )}

      {!loading && !error && result && result.items.length > 0 && (
        <>
          <p className="mb-4 text-sm text-slate-500">{t('events.resultsCount', { count: result.totalCount })}</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={(p) => updateParam('page', String(p))} />
        </>
      )}
    </div>
  );
}
