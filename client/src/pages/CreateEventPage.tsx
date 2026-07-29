import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../lib/api';
import type { EventFormData, EventItem } from '../types';
import EventForm from '../components/EventForm';

export default function CreateEventPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: EventFormData) {
    setLoading(true);
    try {
      const { data: created } = await api.post<EventItem>('/events', data);
      toast.success(t('createEvent.success'));
      navigate(`/events/${created.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">{t('createEvent.heading')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('createEvent.subheading')}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <EventForm submitLabel={t('eventForm.createSubmit')} loading={loading} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
