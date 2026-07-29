import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { CalendarDays, MapPin, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';
import type { EventItem } from '../types';
import { useLanguage } from '../lib/useLanguage';
import { formatDate, formatPrice } from '../lib/format';
import Spinner from '../components/Spinner';
import ConfirmDialog from '../components/ConfirmDialog';

export default function MyEventsPage() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    api
      .get<EventItem[]>('/events/mine')
      .then((res) => setEvents(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/events/${deleteTarget.id}`);
      toast.success(t('myEvents.deleteSuccess'));
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{t('myEvents.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('myEvents.subtitle')}</p>
        </div>
        <Link
          to="/events/new"
          className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700"
        >
          <PlusCircle size={16} /> {t('myEvents.newEvent')}
        </Link>
      </div>

      {loading ? (
        <Spinner />
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <CalendarDays className="text-slate-300" size={36} />
          <p className="font-medium text-slate-600">{t('myEvents.empty')}</p>
          <Link to="/events/new" className="text-sm font-medium text-purple-700 hover:underline">
            {t('myEvents.emptyLink')}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => {
            const sold = event.totalTickets - event.availableTickets;
            return (
              <div
                key={event.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
              >
                <Link to={`/events/${event.id}`} className="h-28 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-40">
                  {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />}
                </Link>

                <div className="flex-1">
                  <Link to={`/events/${event.id}`} className="font-semibold text-slate-800 hover:text-purple-700">
                    {event.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={13} /> {formatDate(event.startDate, lang)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} /> {event.location}
                    </span>
                    <span>{t('myEvents.sold', { sold, total: event.totalTickets })}</span>
                  </div>
                  <span className="mt-2 inline-block text-sm font-semibold text-purple-700">
                    {formatPrice(event.price, lang)}
                  </span>
                </div>

                <div className="flex gap-2 sm:flex-col">
                  <Link
                    to={`/events/${event.id}/edit`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:border-purple-300 hover:text-purple-700"
                  >
                    <Pencil size={14} /> {t('common.edit')}
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(event)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-red-600 hover:border-red-200 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> {t('common.delete')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('myEvents.deleteConfirmTitle')}
        message={t('myEvents.deleteConfirmMsg', { title: deleteTarget?.title })}
        confirmLabel={t('myEvents.deleteButton')}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
