import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../lib/api';
import type { EventFormData, EventItem } from '../types';
import EventForm from '../components/EventForm';
import Spinner from '../components/Spinner';

export default function EditEventPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api
      .get<EventItem>(`/events/${id}`)
      .then((res) => {
        if (!res.data.isOwner) {
          setError(t('editEvent.noPermission'));
          return;
        }
        setEvent(res.data);
      })
      .catch((err) => setError(getErrorMessage(err, t('editEvent.notFound'))))
      .finally(() => setFetching(false));
  }, [id, t]);

  async function handleSubmit(data: EventFormData) {
    if (!id) return;
    setLoading(true);
    try {
      await api.put(`/events/${id}`, data);
      toast.success(t('editEvent.success'));
      navigate(`/events/${id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <Spinner />;

  if (error || !event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-red-600">{error || t('editEvent.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">{t('editEvent.heading')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('editEvent.subheading')}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <EventForm
          initialData={{ ...event, imageUrl: event.imageUrl ?? '' }}
          submitLabel={t('eventForm.editSubmit')}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
