import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSetting, saveSettings, DEFAULT_QURAN_PAGES } from '../lib/db';
import { Book, Globe, Calendar } from 'lucide-react';

export default function SettingsPanel() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  // Get language setting with default value
  const { data: language = i18n.language || 'en' } = useQuery({
    queryKey: ['settings', 'language'],
    queryFn: async () => {
      const data = await getSetting('language');
      return data || i18n.language || 'en';
    }
  });

  // Get total pages setting with default value
  const { data: totalPages = DEFAULT_QURAN_PAGES } = useQuery({
    queryKey: ['settings', 'totalQuranPages'],
    queryFn: async () => {
      const data = await getSetting('totalQuranPages');
      return data || DEFAULT_QURAN_PAGES;
    }
  });

  // Get Ramadhan end date setting with default value
  const { data: ramadhanEndDate = '2024-04-09' } = useQuery({
    queryKey: ['settings', 'ramadhanEndDate'],
    queryFn: async () => {
      const data = await getSetting('ramadhanEndDate');
      return data || '2024-04-09';
    }
  });

  const mutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) => saveSettings(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['quranProgress'] }); // Refresh Quran progress to update suggestions
    }
  });

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    mutation.mutate({ key: 'language', value: newLang });
    i18n.changeLanguage(newLang);
  };

  const handleTotalPagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pages = Math.max(1, parseInt(e.target.value) || DEFAULT_QURAN_PAGES);
    mutation.mutate({ key: 'totalQuranPages', value: pages });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    mutation.mutate({ key: 'ramadhanEndDate', value: newDate });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">{t('settings.title')}</h2>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="text-emerald-600" size={20} />
            <label className="block text-sm font-medium text-gray-700">
              {t('settings.language')}
            </label>
          </div>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="en">English</option>
            <option value="id">Indonesian</option>
          </select>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Book className="text-emerald-600" size={20} />
            <label className="block text-sm font-medium text-gray-700">
              {t('settings.totalQuranPages')}
            </label>
          </div>
          <input
            type="number"
            min="1"
            value={totalPages}
            onChange={handleTotalPagesChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            {t('settings.totalQuranPagesHelp')}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-emerald-600" size={20} />
            <label className="block text-sm font-medium text-gray-700">
              {t('settings.ramadhanEndDate')}
            </label>
          </div>
          <input
            type="date"
            value={ramadhanEndDate}
            onChange={handleEndDateChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            {t('settings.ramadhanEndDateHelp')}
          </p>
        </div>
      </div>
    </div>
  );
}