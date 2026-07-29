import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { CalendarDays, MapPin, Ticket, X } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';
import type { Booking } from '../types';
import { useLanguage } from '../lib/useLanguage';
import { formatDateTime, formatPrice } from '../lib/format';
import Spinner from '../components/Spinner';
import ConfirmDialog from '../components/ConfirmDialog';

export default function MyBookingsPage() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  function load() {
    setLoading(true);
    api
      .get<Booking[]>('/bookings/mine')
      .then((res) => setBookings(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await api.delete(`/bookings/${cancelTarget.id}`);
      toast.success(t('myBookings.cancelSuccess'));
      setBookings((prev) => prev.map((b) => (b.id === cancelTarget.id ? { ...b, status: 1 } : b)));
      setCancelTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">{t('myBookings.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('myBookings.subtitle')}</p>
      </div>

      {loading ? (
        <Spinner />
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <Ticket className="text-slate-300" size={36} />
          <p className="font-medium text-slate-600">{t('myBookings.empty')}</p>
          <Link to="/events" className="text-sm font-medium text-purple-700 hover:underline">
            {t('myBookings.emptyLink')}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => {
            const cancelled = booking.status === 1;
            return (
              <div
                key={booking.id}
                className={`flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center ${
                  cancelled ? 'border-slate-200 opacity-60' : 'border-slate-200'
                }`}
              >
                <Link to={`/events/${booking.eventId}`} className="h-24 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-32">
                  {booking.eventImageUrl && (
                    <img src={booking.eventImageUrl} alt={booking.eventTitle} className="h-full w-full object-cover" />
                  )}
                </Link>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link to={`/events/${booking.eventId}`} className="font-semibold text-slate-800 hover:text-purple-700">
                      {booking.eventTitle}
                    </Link>
                    {cancelled && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                        {t('myBookings.cancelled')}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={13} /> {formatDateTime(booking.eventStartDate, lang)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} /> {booking.eventLocation}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-mono font-semibold tracking-wider text-purple-700">#{booking.ticketCode}</span>
                    <span className="text-slate-500">
                      {booking.quantity} {t('eventDetails.ticketWord')}
                    </span>
                    <span className="font-semibold text-slate-800">{formatPrice(booking.totalPrice, lang)}</span>
                  </div>
                </div>

                {!cancelled && (
                  <button
                    onClick={() => setCancelTarget(booking)}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-red-600 hover:border-red-200 hover:bg-red-50"
                  >
                    <X size={14} /> {t('myBookings.cancelBooking')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        title={t('myBookings.cancelConfirmTitle')}
        message={t('myBookings.cancelConfirmMsg', { quantity: cancelTarget?.quantity, title: cancelTarget?.eventTitle })}
        confirmLabel={t('myBookings.cancelButton')}
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
