import axios from 'axios';
import i18n from '../i18n';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5292';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('evently_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(error: unknown, fallback?: string): string {
  const fallbackMessage = fallback || i18n.t('errors.generic');

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const rawMessage = data?.message || (data?.errors && Object.values(data.errors)[0]?.[0]);

    if (rawMessage) {
      const translated = i18n.exists(`errors.${rawMessage}`) ? i18n.t(`errors.${rawMessage}`) : rawMessage;
      return translated;
    }
    if (error.response?.status === 401) return i18n.t('errors.unauthorized');
    if (error.response?.status === 403) return i18n.t('errors.forbidden');
  }
  return fallbackMessage;
}
