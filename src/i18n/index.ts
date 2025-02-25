import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      appName: "Ramadhan Tracker",
      onboarding: {
        welcome: "Welcome to Ramadhan Tracker",
        selectLanguage: "Select Your Language",
        languageDescription:
          "Choose your preferred language for the app interface",
        quranPages: "Quran Pages",
        ramadhanEndDate: "Ramadhan End Date",
        back: "Back",
        next: "Next",
        finish: "Get Started",
      },
      quranTracker: {
        title: "Quran Progress",
        pagesRead: "Pages Read Today",
        totalPagesRead: "Total Pages Read",
        juzRead: "Juz Read Today",
        totalJuzRead: "Total Juz Read",
        currentJuz: "Current Juz",
        currentJuzHelp: "Enter the Juz you are currently reading",
        khatamCount: "Total Khatam",
        addProgress: "Add Progress",
        notes: "Notes",
        notesPlaceholder:
          "Add any notes about your reading (e.g., verses that touched your heart)",
        target: "Completion Target",
        selectDate: "Select Date",
        invalidDate: "Please select a valid date",
        futureDateError: "Cannot add progress for future dates",
        toCompleteKhatam: "To complete {{khatam}} khatam in {{daysLeft}} days",
        suggestionPage:
          "Still need to read {{remainingPages}} pages ({{pages}} pages per day)",
        suggestionJuz:
          "Still need to read {{remainingJuz}} juz ({{juz}} juz per day)",
      },
      dailyIbadah: {
        title: "Daily Ibadah",
        history: "Ibadah History",
        historyTitle: "History",
        selectDate: "Select Date",
        date: "Date",
        currentStreak: "Current Streak",
        daysStreak: "Days Streak",
        futureDateError: "Cannot record ibadah for future dates",
        timePeriod: "Time Period",
        periods: {
          week: "Last 7 Days",
          twoWeeks: "Last 14 Days",
          month: "Last 30 Days",
          all: "All Time",
        },
        prayers: {
          fajr: "Fajr",
          dhuhr: "Dhuhr",
          asr: "Asr",
          maghrib: "Maghrib",
          isha: "Isha",
          tarawih: "Tarawih",
          tahajjud: "Tahajjud",
        },
        dhikr: "Dhikr",
        charity: "Charity",
      },
      settings: {
        title: "Settings",
        language: "Language",
        totalQuranPages: "Total Quran Pages",
        totalQuranPagesHelp: "Default is 604 pages (standard Quran)",
        ramadhanEndDate: "Ramadhan End Date",
        ramadhanEndDateHelp:
          "Set the last day of Ramadhan to calculate daily targets",
        notifications: "Notifications",
        theme: "Theme",
      },
    },
  },
  id: {
    translation: {
      appName: "Ramadhan Tracker",
      onboarding: {
        welcome: "Selamat Datang di Ramadhan Tracker",
        selectLanguage: "Pilih Bahasa",
        languageDescription:
          "Pilih bahasa yang Anda inginkan untuk tampilan aplikasi",
        quranPages: "Halaman Quran",
        ramadhanEndDate: "Tanggal Akhir Ramadhan",
        back: "Kembali",
        next: "Lanjut",
        finish: "Mulai",
      },
      quranTracker: {
        title: "Progress Quran",
        pagesRead: "Halaman Dibaca Hari Ini",
        totalPagesRead: "Total Halaman Dibaca",
        juzRead: "Juz Dibaca Hari Ini",
        totalJuzRead: "Total Juz Dibaca",
        currentJuz: "Juz Saat Ini",
        currentJuzHelp: "Masukkan Juz yang sedang Anda baca",
        khatamCount: "Total Khatam",
        addProgress: "Tambah Progress",
        notes: "Catatan",
        notesPlaceholder:
          "Tambahkan catatan tentang bacaan Anda (mis., ayat yang menyentuh hati)",
        target: "Target Khatam",
        selectDate: "Pilih Tanggal",
        invalidDate: "Silakan pilih tanggal yang valid",
        futureDateError:
          "Tidak dapat menambahkan progress untuk tanggal mendatang",
        toCompleteKhatam:
          "Untuk menyeleseikan {{khatam}} khatam dalam {{daysLeft}} hari",
        suggestionPage:
          "Masih perlu membaca {{remainingPages}} halaman ({{pages}} halam setiap hari)",
        suggestionJuz:
          "Masih perlu membaca {{remainingJuz}} juz ({{juz}} juz per hari)",
      },
      dailyIbadah: {
        title: "Ibadah Harian",
        history: "Riwayat Ibadah",
        historyTitle: "Riwayat",
        selectDate: "Pilih Tanggal",
        date: "Tanggal",
        currentStreak: "Rangkaian Saat Ini",
        daysStreak: "Hari Berturut-turut",
        futureDateError: "Tidak dapat mencatat ibadah untuk tanggal mendatang",
        timePeriod: "Periode Waktu",
        periods: {
          week: "7 Hari Terakhir",
          twoWeeks: "14 Hari Terakhir",
          month: "30 Hari Terakhir",
          all: "Semua Waktu",
        },
        prayers: {
          fajr: "Subuh",
          dhuhr: "Dzuhur",
          asr: "Ashar",
          maghrib: "Maghrib",
          isha: "Isya",
          tarawih: "Tarawih",
          tahajjud: "Tahajjud",
        },
        dhikr: "Dzikir",
        charity: "Sedekah",
      },
      settings: {
        title: "Pengaturan",
        language: "Bahasa",
        totalQuranPages: "Total Halaman Quran",
        totalQuranPagesHelp: "Default adalah 604 halaman (Quran standar)",
        ramadhanEndDate: "Tanggal Akhir Ramadhan",
        ramadhanEndDateHelp:
          "Tentukan hari terakhir Ramadhan untuk menghitung target harian",
        notifications: "Notifikasi",
        theme: "Tema",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
