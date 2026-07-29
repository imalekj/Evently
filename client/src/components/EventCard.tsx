import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDays, MapPin } from 'lucide-react';
import type { EventItem } from '../types';
import { formatDate, formatPrice } from '../lib/format';
import { useLanguage } from '../lib/useLanguage';

export default function EventCard({ event }: { event: EventItem }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const soldOut = event.availableTickets <= 0;

  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-purple-300"
    >
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
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
            <CalendarDays size={32} />
          </div>
        )}
        <span className="absolute top-2.5 start-2.5 rounded-md bg-white/95 px-2.5 py-1 text-xs font-medium text-purple-700">
          {event.categoryName}
        </span>
        {soldOut && (
          <span className="absolute top-2.5 end-2.5 rounded-md bg-slate-900/85 px-2.5 py-1 text-xs font-medium text-white">
            {t('events.soldOut')}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-slate-800 group-hover:text-purple-700">
          {event.title}
        </h3>

        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays size={14} />
          {formatDate(event.startDate, lang)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin size={14} />
          <span className="truncate">{event.location}</span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm font-semibold text-purple-700">{formatPrice(event.price, lang)}</span>
          <span className="text-xs text-slate-400">{t('events.ticketsLeft', { count: event.availableTickets })}</span>
        </div>
      </div>
    </Link>
  );
}
