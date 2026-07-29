import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';
import type { Booking } from '../types';
import { useLanguage } from '../lib/useLanguage';
import { formatDateTime, formatPrice } from '../lib/format';
import Spinner from '../components/Spinner';

export default function BookingSuccessPage() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError(t('bookingSuccess.missingSession'));
      setLoading(false);
      return;
    }
    api
      .get<Booking>(`/bookings/confirm/${sessionId}`)
      .then((res) => setBooking(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [sessionId, t]);

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      {error ? (
        <>
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <XCircle size={28} />
          </span>
          <h1 className="text-xl font-bold text-slate-800">{t('bookingSuccess.errorTitle')}</h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <Link to="/events" className="mt-6 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700">
            {t('eventDetails.backToEvents')}
          </Link>
        </>
      ) : booking ? (
        <>
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={28} />
          </span>
          <h1 className="text-xl font-bold text-slate-800">{t('bookingSuccess.title')}</h1>
          <p className="mt-2 text-sm text-slate-500">{t('bookingSuccess.subtitle', { title: booking.eventTitle })}</p>

          <div className="mt-6 w-full rounded-xl border border-slate-200 p-5 text-start">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{t('admin.colTicketCode')}</span>
              <span className="font-mono font-semibold text-purple-700">#{booking.ticketCode}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">{t('eventDetails.ticketWord')}</span>
              <span className="font-medium text-slate-800">{booking.quantity}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">{t('eventDetails.totalLabel')}</span>
              <span className="font-semibold text-slate-800">{formatPrice(booking.totalPrice, lang)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">{t('events.sortDate')}</span>
              <span className="text-slate-700">{formatDateTime(booking.eventStartDate, lang)}</span>
            </div>
          </div>

          <Link
            to="/my-bookings"
            className="mt-6 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700"
          >
            {t('nav.myBookings')}
          </Link>
        </>
      ) : null}
    </div>
  );
}
