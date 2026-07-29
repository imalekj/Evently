import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import type { Category, EventFormData } from '../types';

interface Props {
  initialData?: Partial<EventFormData>;
  submitLabel: string;
  loading: boolean;
  onSubmit: (data: EventFormData) => void;
}

function toLocalInput(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500';

export default function EventForm({ initialData, submitLabel, loading, onSubmit }: Props) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<EventFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    categoryId: initialData?.categoryId || 0,
    location: initialData?.location || '',
    startDate: toLocalInput(initialData?.startDate),
    endDate: toLocalInput(initialData?.endDate),
    imageUrl: initialData?.imageUrl || '',
    price: initialData?.price ?? 0,
    totalTickets: initialData?.totalTickets ?? 50,
  });

  useEffect(() => {
    api.get<Category[]>('/categories').then((res) => {
      setCategories(res.data);
      setForm((f) => (f.categoryId ? f : { ...f, categoryId: res.data[0]?.id || 0 }));
    });
  }, []);

  function update<K extends keyof EventFormData>(key: K, value: EventFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      ...form,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      imageUrl: form.imageUrl.trim() || '',
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('eventForm.titleLabel')}</label>
        <input
          required
          maxLength={200}
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder={t('eventForm.titlePlaceholder')}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('eventForm.descriptionLabel')}</label>
        <textarea
          required
          rows={5}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder={t('eventForm.descriptionPlaceholder')}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('eventForm.categoryLabel')}</label>
          <select
            required
            value={form.categoryId}
            onChange={(e) => update('categoryId', Number(e.target.value))}
            className={inputClass}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('eventForm.locationLabel')}</label>
          <input
            required
            maxLength={250}
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder={t('eventForm.locationPlaceholder')}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('eventForm.startDateLabel')}</label>
          <input
            required
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => update('startDate', e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('eventForm.endDateLabel')}</label>
          <input
            required
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => update('endDate', e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('eventForm.priceLabel')}</label>
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => update('price', Number(e.target.value))}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-400">{t('eventForm.priceHint')}</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('eventForm.totalTicketsLabel')}</label>
          <input
            required
            type="number"
            min={1}
            value={form.totalTickets}
            onChange={(e) => update('totalTickets', Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('eventForm.imageUrlLabel')}</label>
        <input
          type="url"
          value={form.imageUrl}
          onChange={(e) => update('imageUrl', e.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-lg bg-purple-600 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60"
      >
        {loading ? t('eventForm.saving') : submitLabel}
      </button>
    </form>
  );
}
