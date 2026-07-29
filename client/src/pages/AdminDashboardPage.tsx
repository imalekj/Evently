import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { CalendarCheck, DollarSign, Ticket, Trash2, Users as UsersIcon } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';
import type { AdminBooking, AdminStats, AdminUser, EventItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../lib/useLanguage';
import { formatDate, formatPrice } from '../lib/format';
import Spinner from '../components/Spinner';
import ConfirmDialog from '../components/ConfirmDialog';

type Tab = 'events' | 'users' | 'bookings';

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { user: currentUser } = useAuth();

  const [tab, setTab] = useState<Tab>('events');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);

  const [deleteEventTarget, setDeleteEventTarget] = useState<EventItem | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([
      api.get<AdminStats>('/admin/stats'),
      api.get<EventItem[]>('/admin/events'),
      api.get<AdminUser[]>('/admin/users'),
      api.get<AdminBooking[]>('/admin/bookings'),
    ])
      .then(([statsRes, eventsRes, usersRes, bookingsRes]) => {
        setStats(statsRes.data);
        setEvents(eventsRes.data);
        setUsers(usersRes.data);
        setBookings(bookingsRes.data);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDeleteEvent() {
    if (!deleteEventTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/events/${deleteEventTarget.id}`);
      setEvents((prev) => prev.filter((e) => e.id !== deleteEventTarget.id));
      toast.success(t('myEvents.deleteSuccess'));
      setDeleteEventTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteUser() {
    if (!deleteUserTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteUserTarget.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserTarget.id));
      toast.success(t('admin.deleteUserSuccess'));
      setDeleteUserTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const statCards = stats
    ? [
        { icon: UsersIcon, label: t('admin.statUsers'), value: stats.totalUsers },
        { icon: CalendarCheck, label: t('admin.statEvents'), value: stats.totalEvents },
        { icon: Ticket, label: t('admin.statTickets'), value: stats.ticketsSold },
        { icon: DollarSign, label: t('admin.statRevenue'), value: formatPrice(stats.totalRevenue, lang) },
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">{t('admin.dashboard')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('admin.subtitle')}</p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statCards.map((card) => (
              <div key={card.label} className="rounded-xl border border-slate-200 p-4">
                <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                  <card.icon size={16} />
                </span>
                <p className="text-lg font-bold text-slate-800">{card.value}</p>
                <p className="text-xs text-slate-500">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="mb-4 flex gap-1 border-b border-slate-200">
            {(['events', 'users', 'bookings'] as Tab[]).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setTab(tabKey)}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
                  tab === tabKey ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t(`admin.tab${tabKey.charAt(0).toUpperCase()}${tabKey.slice(1)}`)}
              </button>
            ))}
          </div>

          {tab === 'events' && (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-start text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colEvent')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colCategory')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colOrganizer')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colDate')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colPrice')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colTickets')}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        {t('admin.noEvents')}
                      </td>
                    </tr>
                  )}
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td className="max-w-[200px] truncate px-4 py-3 font-medium text-slate-800">{event.title}</td>
                      <td className="px-4 py-3 text-slate-500">{event.categoryName}</td>
                      <td className="px-4 py-3 text-slate-500">{event.organizerName}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(event.startDate, lang)}</td>
                      <td className="px-4 py-3 text-slate-500">{formatPrice(event.price, lang)}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {event.totalTickets - event.availableTickets}/{event.totalTickets}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <button
                          onClick={() => setDeleteEventTarget(event)}
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                          aria-label={t('common.delete')}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'users' && (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-start text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colUser')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colEmail')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colRole')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colJoined')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colEvents')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colBookings')}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        {t('admin.noUsers')}
                      </td>
                    </tr>
                  )}
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 font-medium text-slate-800">{u.fullName}</td>
                      <td className="px-4 py-3 text-slate-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.role === 1 ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {u.role === 1 ? t('admin.roleAdmin') : t('admin.roleUser')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt, lang)}</td>
                      <td className="px-4 py-3 text-slate-500">{u.eventsCount}</td>
                      <td className="px-4 py-3 text-slate-500">{u.bookingsCount}</td>
                      <td className="px-4 py-3 text-end">
                        {u.role !== 1 && u.id !== currentUser?.id && (
                          <button
                            onClick={() => setDeleteUserTarget(u)}
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                            aria-label={t('common.delete')}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'bookings' && (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-start text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colTicketCode')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colEvent')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colUser')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colQuantity')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colTotal')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.colStatus')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        {t('admin.noBookings')}
                      </td>
                    </tr>
                  )}
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-purple-700">#{b.ticketCode}</td>
                      <td className="max-w-[180px] truncate px-4 py-3 text-slate-700">{b.eventTitle}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {b.userFullName}
                        <span className="block text-xs text-slate-400">{b.userEmail}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{b.quantity}</td>
                      <td className="px-4 py-3 text-slate-500">{formatPrice(b.totalPrice, lang)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            b.status === 1 ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {b.status === 1 ? t('myBookings.cancelled') : t('admin.statusConfirmed')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteEventTarget}
        title={t('eventDetails.deleteConfirmTitle')}
        message={t('admin.deleteEventConfirm', { title: deleteEventTarget?.title })}
        confirmLabel={t('eventDetails.deleteConfirmButton')}
        loading={deleting}
        onConfirm={handleDeleteEvent}
        onCancel={() => setDeleteEventTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteUserTarget}
        title={t('common.delete')}
        message={t('admin.deleteUserConfirm', { name: deleteUserTarget?.fullName })}
        confirmLabel={t('common.delete')}
        loading={deleting}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteUserTarget(null)}
      />
    </div>
  );
}
