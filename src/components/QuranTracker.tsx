import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  format,
  parseISO,
  isValid,
  isFuture,
  startOfDay,
  differenceInDays,
  addDays,
} from "date-fns";
import {
  getDailyQuranProgress,
  saveQuranProgress,
  getAllQuranProgress,
  getSetting,
  DEFAULT_QURAN_PAGES,
  type QuranProgress,
} from "../lib/db";
import {
  BookOpen,
  Target,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Award,
  BookMarked,
  AlertCircle,
  Calculator,
} from "lucide-react";

const TOTAL_JUZ = 30;

export default function QuranTracker() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [error, setError] = useState<string | null>(null);

  // Get total pages from settings
  const { data: totalPages = DEFAULT_QURAN_PAGES } = useQuery({
    queryKey: ["settings", "totalQuranPages"],
    queryFn: async () => {
      const data = await getSetting("totalQuranPages");
      return data || DEFAULT_QURAN_PAGES;
    },
  });

  // Get Ramadhan end date from settings
  const { data: ramadhanEndDate } = useQuery({
    queryKey: ["settings", "ramadhanEndDate"],
    queryFn: async () => {
      const data = await getSetting("ramadhanEndDate");
      return data || format(addDays(new Date(), 30), "yyyy-MM-dd");
    },
  });

  // Get selected day's progress
  const { data: dayProgress } = useQuery({
    queryKey: ["quranProgress", selectedDate],
    queryFn: async () => {
      const data = await getDailyQuranProgress(selectedDate);
      return (
        data ||
        ({
          date: selectedDate,
          pagesRead: 0,
          juzRead: 0,
          currentJuz: 1,
          notes: "",
          target: 1,
          khatamCount: 0,
        } as QuranProgress)
      );
    },
  });

  // Get total progress
  const { data: totalProgress } = useQuery({
    queryKey: ["quranProgressTotal"],
    queryFn: async () => {
      const allProgress = await getAllQuranProgress();
      const total = allProgress.reduce(
        (acc, curr) => ({
          pagesRead: acc.pagesRead + curr.pagesRead,
          juzRead: acc.juzRead + curr.juzRead,
          khatamCount: Math.max(acc.khatamCount, curr.khatamCount || 0),
        }),
        { pagesRead: 0, juzRead: 0, khatamCount: 0 }
      );

      // Calculate additional khatams based on total juz read
      const additionalKhatams = Math.floor(total.juzRead / TOTAL_JUZ);
      total.khatamCount += additionalKhatams;

      return total;
    },
  });

  const mutation = useMutation({
    mutationFn: saveQuranProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quranProgress"] });
      queryClient.invalidateQueries({ queryKey: ["quranProgressTotal"] });
      setError(null);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const date = formData.get("date") as string;

    // Validate date
    if (!date || !isValid(parseISO(date))) {
      setError(t("quranTracker.invalidDate"));
      return;
    }

    // Check if date is in the future
    if (isFuture(startOfDay(parseISO(date)))) {
      setError(t("quranTracker.futureDateError"));
      return;
    }

    const currentJuz = Number(formData.get("currentJuz"));
    const juzRead = Number(formData.get("juz"));
    const prevKhatamCount = dayProgress?.khatamCount || 0;

    // Calculate new khatam count
    let newKhatamCount = prevKhatamCount;
    if (currentJuz + juzRead > TOTAL_JUZ) {
      newKhatamCount += Math.floor((currentJuz + juzRead) / TOTAL_JUZ);
    }

    mutation.mutate({
      date,
      pagesRead: Number(formData.get("pages")),
      juzRead,
      currentJuz,
      notes: formData.get("notes") as string,
      target: Number(formData.get("target")),
      khatamCount: newKhatamCount,
    });
  };

  const calculateProgress = () => {
    if (!totalProgress) return 0;
    return Math.min(100, (totalProgress.pagesRead / totalPages) * 100);
  };

  const calculateDailyTarget = (targetKhatam: number) => {
    try {
      const today = new Date();
      const endDate = ramadhanEndDate
        ? parseISO(ramadhanEndDate)
        : addDays(today, 30);
      // Validate end date
      if (!isValid(endDate)) {
        return {
          pages: 0,
          juz: 0,
          daysLeft: 30,
          remainingPages: 0,
          remainingJuz: 0,
        };
      }

      const daysLeft = Math.max(1, differenceInDays(endDate, today));

      // Calculate remaining pages and juz needed
      const totalPagesNeeded = totalPages * targetKhatam;
      const totalJuzNeeded = TOTAL_JUZ * targetKhatam;

      const remainingPages = Math.max(
        0,
        totalPagesNeeded - (totalProgress?.pagesRead || 0)
      );
      const remainingJuz = Math.max(
        0,
        totalJuzNeeded - (totalProgress?.juzRead || 0)
      );

      // Calculate daily targets based on remaining work
      const dailyPages = Math.ceil(remainingPages / daysLeft);
      const dailyJuz = Math.ceil(remainingJuz / daysLeft);

      return {
        pages: dailyPages,
        juz: dailyJuz,
        daysLeft,
        remainingPages,
        remainingJuz,
      };
    } catch (error) {
      console.error("Error calculating daily target:", error);
      return {
        pages: 0,
        juz: 0,
        daysLeft: 30,
        remainingPages: 0,
        remainingJuz: 0,
      };
    }
  };

  const progressPercentage = calculateProgress();

  const handleDateChange = (date: string) => {
    setError(null);
    if (isValid(parseISO(date))) {
      if (isFuture(startOfDay(parseISO(date)))) {
        setError(t("quranTracker.futureDateError"));
        return;
      }
      setSelectedDate(date);
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    const date = parseISO(selectedDate);
    const newDate =
      direction === "prev"
        ? new Date(date.setDate(date.getDate() - 1))
        : new Date(date.setDate(date.getDate() + 1));

    // Prevent navigating to future dates
    if (isFuture(startOfDay(newDate))) {
      return;
    }

    setSelectedDate(format(newDate, "yyyy-MM-dd"));
    setError(null);
  };

  const today = format(new Date(), "yyyy-MM-dd");
  const target = dayProgress?.target || 1;
  const suggestion = calculateDailyTarget(target);

  return (
    <div className="space-y-6">
      {/* Total Progress Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="text-emerald-600" />
          {t("quranTracker.title")}
        </h2>

        {/* Khatam Counter */}
        <div className="mb-6 bg-emerald-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 text-emerald-700">
            <Award size={24} className="text-emerald-600" />
            <div>
              <h3 className="font-semibold">{t("quranTracker.khatamCount")}</h3>
              <p className="text-2xl font-bold">
                {totalProgress?.khatamCount || 0}x Khatam
              </p>
            </div>
          </div>
        </div>

        {/* Total Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{Math.round(progressPercentage)}% Complete</span>
            <span>
              {totalProgress?.pagesRead || 0}/{totalPages} Pages
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Total Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <BookOpen size={20} />
              <span className="font-medium">
                {t("quranTracker.totalPagesRead")}
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-800">
              {totalProgress?.pagesRead || 0}
            </p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <Target size={20} />
              <span className="font-medium">
                {t("quranTracker.totalJuzRead")}
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-800">
              {totalProgress?.juzRead || 0}/30
            </p>
          </div>
        </div>
      </div>

      {/* Daily Progress Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="text-emerald-600" />
          {t("quranTracker.addProgress")}
        </h3>

        <div className="space-y-4">
          {/* Date Selection */}
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigateDate("prev")}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft size={20} />
              </button>
              <input
                type="date"
                name="date"
                value={selectedDate}
                max={today}
                onChange={(e) => handleDateChange(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => navigateDate("next")}
                className={`p-2 hover:bg-gray-100 rounded-full ${
                  isFuture(startOfDay(parseISO(selectedDate)))
                    ? "opacity-50 cursor-not-allowed"
                    : ""
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("quranTracker.target")}
            </label>
            <select
              name="target"
              value={target}
              onChange={(e) =>
                mutation.mutate({
                  ...dayProgress,
                  target: Number(e.target.value),
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="1">1x Khatam</option>
              <option value="2">2x Khatam</option>
              <option value="3">3x Khatam</option>
              <option value="4">4x Khatam</option>
              <option value="5">5x Khatam</option>
              <option value="6">6x Khatam</option>
              <option value="7">7x Khatam</option>
              <option value="8">8x Khatam</option>
              <option value="9">9x Khatam</option>
              <option value="10">10x Khatam</option>
            </select>

            {/* Target Suggestions */}
            <div className="mt-3 bg-emerald-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-emerald-700 mb-2">
                <Calculator size={20} />
                <span className="font-medium">Daily Target Suggestion</span>
              </div>
              <div className="space-y-2 text-sm text-emerald-800">
                <p>
                  {t("quranTracker.toCompleteKhatam", {
                    khatam: target,
                    daysLeft: suggestion.daysLeft,
                  })}
                  :
                </p>
                <ul className="list-disc list-inside pl-2">
                  <li>
                    {t("quranTracker.suggestionPage", {
                      remainingPages: suggestion.remainingPages,
                      pages: suggestion.pages,
                    })}
                  </li>
                  <li>
                    {t("quranTracker.suggestionJuz", {
                      remainingJuz: suggestion.remainingJuz,
                      juz: suggestion.juz,
                    })}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("quranTracker.currentJuz")}
            </label>
            <div className="flex items-center gap-2">
              <BookMarked size={20} className="text-emerald-600" />
              <input
                type="number"
                name="currentJuz"
                min="1"
                max={TOTAL_JUZ}
                defaultValue={dayProgress?.currentJuz || 1}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {t("quranTracker.currentJuzHelp")}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("quranTracker.pagesRead")}
            </label>
            <input
              type="number"
              name="pages"
              min="0"
              max={totalPages}
              defaultValue={dayProgress?.pagesRead}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("quranTracker.juzRead")}
            </label>
            <input
              type="number"
              name="juz"
              min="0"
              max={TOTAL_JUZ}
              defaultValue={dayProgress?.juzRead}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("quranTracker.notes")}
            </label>
            <textarea
              name="notes"
              defaultValue={dayProgress?.notes}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder={t("quranTracker.notesPlaceholder")}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors duration-200"
          >
            {t("quranTracker.addProgress")}
          </button>
        </div>
      </form>
    </div>
  );
}
