import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, isValid, isFuture, startOfDay } from 'date-fns';
import { getDailyIbadah, saveDailyIbadah, type DailyIbadah } from '../lib/db';
import { Check, Calendar, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const defaultIbadah = {
  date: '',
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
  tarawih: false,
  tahajjud: false,
  dhikr: false,
  charity: false
};

export default function DailyIbadah() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [error, setError] = useState<string | null>(null);

  // Get current day's ibadah
  const { data: ibadah } = useQuery({
    queryKey: ['dailyIbadah', selectedDate],
    queryFn: async () => {
      const data = await getDailyIbadah(selectedDate);
      return data || { ...defaultIbadah, date: selectedDate } as DailyIbadah;
    }
  });

  const mutation = useMutation({
    mutationFn: saveDailyIbadah,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyIbadah'] });
      queryClient.invalidateQueries({ queryKey: ['dailyIbadahHistory'] });
      setError(null);
    }
  });

  const handleDateChange = (date: string) => {
    setError(null);
    if (isValid(parseISO(date))) {
      if (isFuture(startOfDay(parseISO(date)))) {
        setError(t('dailyIbadah.futureDateError'));
        return;
      }
      setSelectedDate(date);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const date = parseISO(selectedDate);
    const newDate = direction === 'prev' 
      ? new Date(date.setDate(date.getDate() - 1))
      : new Date(date.setDate(date.getDate() + 1));
    
    // Prevent navigating to future dates
    if (isFuture(startOfDay(newDate))) {
      return;
    }
    
    setSelectedDate(format(newDate, 'yyyy-MM-dd'));
    setError(null);
  };

  const toggleIbadah = (key: keyof typeof defaultIbadah) => {
    if (!ibadah) return;
    
    // Prevent modifying future dates
    if (isFuture(startOfDay(parseISO(ibadah.date)))) {
      setError(t('dailyIbadah.futureDateError'));
      return;
    }
    
    const newIbadah = {
      ...ibadah,
      [key]: !ibadah[key]
    };
    mutation.mutate(newIbadah);
  };

  const renderCheckbox = (key: keyof typeof defaultIbadah, label: string) => {
    if (!ibadah) return null;
    
    const isChecked = ibadah[key];
    
    return (
      <button
        onClick={() => toggleIbadah(key)}
        className={clsx(
          'flex items-center justify-between w-full p-4 rounded-lg border',
          isChecked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'
        )}
      >
        <span className="text-gray-700">{label}</span>
        <div className={clsx(
          'w-6 h-6 rounded-full flex items-center justify-center',
          isChecked ? 'bg-emerald-600' : 'bg-gray-200'
        )}>
          {isChecked && <Check size={16} className="text-white" />}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{t('dailyIbadah.title')}</h2>
        
        {/* Date Selection */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-emerald-600" size={20} />
            <span className="font-medium text-gray-700">{t('dailyIbadah.selectDate')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={(e) => handleDateChange(e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => navigateDate('next')}
              className={`p-2 hover:bg-gray-100 rounded-full ${
                isFuture(startOfDay(parseISO(selectedDate))) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isFuture(startOfDay(parseISO(selectedDate)))}
            >
              <ChevronRight size={20} />
            </button>
          </div>
          {error && (
            <div className="mt-2 text-red-600 text-sm flex items-center gap-1">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {renderCheckbox('fajr', t('dailyIbadah.prayers.fajr'))}
          {renderCheckbox('dhuhr', t('dailyIbadah.prayers.dhuhr'))}
          {renderCheckbox('asr', t('dailyIbadah.prayers.asr'))}
          {renderCheckbox('maghrib', t('dailyIbadah.prayers.maghrib'))}
          {renderCheckbox('isha', t('dailyIbadah.prayers.isha'))}
          {renderCheckbox('tarawih', t('dailyIbadah.prayers.tarawih'))}
          {renderCheckbox('tahajjud', t('dailyIbadah.prayers.tahajjud'))}
          {renderCheckbox('dhikr', t('dailyIbadah.dhikr'))}
          {renderCheckbox('charity', t('dailyIbadah.charity'))}
        </div>
      </div>
    </div>
  );
}