import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { CalendarDays, MapPin, Minus, Pencil, Plus, Tag, Trash2, User as UserIcon } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';
import type { Booking, EventItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../lib/useLanguage';
import { formatDateTime, formatPrice } from '../lib/format';
import Spinner from '../components/Spinner';
import ConfirmDialog from '../components/ConfirmDialog';

export default function EventDetailsPage() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<EventItem>(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch((err) => setError(getErrorMessage(err, t('eventDetails.notFound'))))
      .finally(() => setLoading(false));
  }, [id, t]);

  useEffect(() => {
    if (searchParams.get('checkout') === 'cancelled') {
      toast(t('bookingSuccess.checkoutCancelled'));
      const next = new URLSearchParams(searchParams);
      next.delete('checkout');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleBook() {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }
    if (!event) return;

    setBooking(true);
    try {
      if (event.price > 0) {
        const { data } = await api.post<{ url: string }>('/bookings/checkout', { eventId: event.id, quantity });
        window.location.href = data.url;
        return;
      }
      await api.post<Booking>('/bookings', { eventId: event.id, quantity });
      toast.success(t('eventDetails.bookingSuccess'));
      const { data } = await api.get<EventItem>(`/events/${event.id}`);
      setEvent(data);
      setQuantity(1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBooking(false);
    }
  }

  async function handleDelete() {
    if (!event) return;
    setDeleting(true);
    try {
      await api.delete(`/events/${event.id}`);
      toast.success(t('eventDetails.deleteSuccess'));
      navigate('/my-events');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(false);
    }
  }

  if (loading) return <Spinner />;

  if (error || !event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-red-600">{error || t('eventDetails.notFound')}</p>
        <Link to="/events" className="mt-4 inline-block text-purple-700 hover:underline">
          {t('eventDetails.backToEvents')}
        </Link>
      </div>
    );
  }

  const soldOut = event.availableTickets <= 0;
  const started = new Date(event.startDate) <= new Date();
  const totalPrice = event.price * quantity;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="relative h-56 w-full bg-slate-100 sm:h-72">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <CalendarDays size={48} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded-md bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                <Tag size={12} /> {event.categoryName}
              </span>
              {soldOut && (
                <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">{t('events.soldOut')}</span>
              )}
              {started && !soldOut && (
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                  {t('eventDetails.started')}
                </span>
              )}
            </div>

            <h1 className="mb-4 text-2xl font-bold text-slate-900">{event.title}</h1>

            <div className="mb-6 flex flex-col gap-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-slate-400" />
                {formatDateTime(event.startDate, lang)} — {formatDateTime(event.endDate, lang)}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" />
                {event.location}
              </div>
              <div className="flex items-center gap-2">
                <UserIcon size={16} className="text-slate-400" />
                {t('eventDetails.publishedBy', { name: event.organizerName })}
              </div>
            </div>

            <h2 className="mb-2 font-semibold text-slate-800">{t('eventDetails.about')}</h2>
            <p className="whitespace-pre-line leading-relaxed text-slate-600">{event.description}</p>

            {event.isOwner && (
              <div className="mt-8 flex gap-3 border-t border-slate-100 pt-6">
                <Link
                  to={`/events/${event.id}/edit`}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-purple-300 hover:text-purple-700"
                >
                  <Pencil size={15} /> {t('eventDetails.editEvent')}
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-red-600 hover:border-red-200 hover:bg-red-50"
                >
                  <Trash2 size={15} /> {t('eventDetails.deleteEvent')}
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="sticky top-24 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">{t('eventDetails.pricePerTicket')}</p>
              <p className="mb-4 text-xl font-bold text-purple-700">{formatPrice(event.price, lang)}</p>
              <p className="mb-4 text-sm text-slate-500">
                {t('eventDetails.ticketsRemaining', { available: event.availableTickets, total: event.totalTickets })}
              </p>

              {event.isOwner ? (
                <p className="rounded-lg bg-white px-3 py-2.5 text-center text-sm text-slate-500">
                  {t('eventDetails.ownEventNotice')}
                </p>
              ) : soldOut ? (
                <button disabled className="w-full rounded-lg bg-slate-300 py-3 text-sm font-semibold text-white">
                  {t('eventDetails.soldOutButton')}
                </button>
              ) : started ? (
                <button disabled className="w-full rounded-lg bg-slate-300 py-3 text-sm font-semibold text-white">
                  {t('eventDetails.eventStartedButton')}
                </button>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between rounded-lg bg-white p-2">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="text-sm font-semibold text-slate-800">
                      {quantity} {t('eventDetails.ticketWord')}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(event.availableTickets, q + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <div className="mb-4 flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>{t('eventDetails.totalLabel')}</span>
                    <span>{formatPrice(totalPrice, lang)}</span>
                  </div>
                  <button
                    onClick={handleBook}
                    disabled={booking}
                    className="w-full rounded-lg bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60"
                  >
                    {booking
                      ? t('common.loading')
                      : !user
                        ? t('eventDetails.loginToBook')
                        : event.price > 0
                          ? t('eventDetails.payAndBook')
                          : t('eventDetails.bookNow')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title={t('eventDetails.deleteConfirmTitle')}
        message={t('eventDetails.deleteConfirmMsg')}
        confirmLabel={t('eventDetails.deleteConfirmButton')}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
