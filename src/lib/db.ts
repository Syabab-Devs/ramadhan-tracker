import { openDB } from 'idb';

const DB_NAME = 'ramadhan-tracker';
const DB_VERSION = 1;

export const DEFAULT_QURAN_PAGES = 604;

export const db = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // Quran progress store
    if (!db.objectStoreNames.contains('quranProgress')) {
      const quranStore = db.createObjectStore('quranProgress', { keyPath: 'date' });
      quranStore.createIndex('date', 'date');
    }

    // Daily ibadah store
    if (!db.objectStoreNames.contains('dailyIbadah')) {
      const ibadahStore = db.createObjectStore('dailyIbadah', { keyPath: 'date' });
      ibadahStore.createIndex('date', 'date');
    }

    // Settings store
    if (!db.objectStoreNames.contains('settings')) {
      db.createObjectStore('settings', { keyPath: 'key' });
    }
  }
});

export interface QuranProgress {
  date: string;
  pagesRead: number;
  juzRead: number;
  currentJuz: number;
  notes: string;
  target: number;
  khatamCount: number;
}

export interface DailyIbadah {
  date: string;
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  tarawih: boolean;
  tahajjud: boolean;
  dhikr: boolean;
  charity: boolean;
}

export interface Settings {
  key: string;
  value: any;
}

export const saveQuranProgress = async (progress: QuranProgress) => {
  const dbInstance = await db;
  return dbInstance.put('quranProgress', progress);
};

export const getDailyQuranProgress = async (date: string) => {
  const dbInstance = await db;
  return dbInstance.get('quranProgress', date);
};

export const getAllQuranProgress = async () => {
  const dbInstance = await db;
  return dbInstance.getAll('quranProgress');
};

export const saveDailyIbadah = async (ibadah: DailyIbadah) => {
  const dbInstance = await db;
  return dbInstance.put('dailyIbadah', ibadah);
};

export const getDailyIbadah = async (date: string) => {
  const dbInstance = await db;
  return dbInstance.get('dailyIbadah', date);
};

export const getAllDailyIbadah = async () => {
  const dbInstance = await db;
  return dbInstance.getAll('dailyIbadah');
};

export const saveSettings = async (key: string, value: any) => {
  const dbInstance = await db;
  return dbInstance.put('settings', { key, value });
};

export const getSetting = async (key: string) => {
  const dbInstance = await db;
  const result = await dbInstance.get('settings', key);
  return result?.value;
};