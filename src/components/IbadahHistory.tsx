import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  parseISO,
  subDays,
  isSameDay,
  isAfter,
  isBefore,
} from "date-fns";
import { getAllDailyIbadah, type DailyIbadah } from "../lib/db";
import { Check, Calendar, Moon, Clock } from "lucide-react";

type TimePeriod = "7" | "14" | "30" | "all";

export default function IbadahHistory() {
  const { t } = useTranslation();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("7");

  // Get all history
  const { data: allHistory } = useQuery({
    queryKey: ["dailyIbadahHistory"],
    queryFn: async () => {
      const allIbadah = await getAllDailyIbadah();
      return allIbadah.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },
  });

  // Filter history based on selected time period
  const history = React.useMemo(() => {
    if (!allHistory) return [];

    const today = new Date();
    const startDate =
      timePeriod === "all"
        ? new Date(0) // Beginning of time
        : subDays(today, parseInt(timePeriod));

    return allHistory.filter((day) => {
      const date = parseISO(day.date);
      return (
        (isAfter(date, startDate) || isSameDay(date, startDate)) &&
        (isBefore(date, today) || isSameDay(date, today))
      );
    });
  }, [allHistory, timePeriod]);

  const calculateStreak = () => {
    if (!allHistory) return 0;
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < allHistory.length; i++) {
      const date = new Date(allHistory[i].date);
      const expectedDate = subDays(today, i);

      if (format(date, "yyyy-MM-dd") !== format(expectedDate, "yyyy-MM-dd"))
        break;

      const allPrayers =
        allHistory[i].fajr &&
        allHistory[i].dhuhr &&
        allHistory[i].asr &&
        allHistory[i].maghrib &&
        allHistory[i].isha &&
        allHistory[i].tarawih;

      if (!allPrayers) break;
      streak++;
    }

    return streak;
  };

  const calculateCompletionRate = () => {
    if (!history.length) return 0;
    const totalDays = history.length;
    const completedDays = history.filter(
      (day) =>
        day.fajr &&
        day.dhuhr &&
        day.asr &&
        day.maghrib &&
        day.isha &&
        day.tarawih
    ).length;

    return Math.round((completedDays / totalDays) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="text-emerald-600" size={24} />
            <h2 className="text-xl font-semibold">
              {t("dailyIbadah.history")}
            </h2>
          </div>

          {/* Time Period Selector */}
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-emerald-600" />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="7">{t("dailyIbadah.periods.week")}</option>
              <option value="14">{t("dailyIbadah.periods.twoWeeks")}</option>
              <option value="30">{t("dailyIbadah.periods.month")}</option>
              <option value="all">{t("dailyIbadah.periods.all")}</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Streak Counter */}
          <div className="bg-emerald-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 text-emerald-700">
              <Moon size={24} className="text-emerald-600" />
              <div>
                <h3 className="font-semibold">
                  {t("dailyIbadah.currentStreak")}
                </h3>
                <p className="text-2xl font-bold">
                  {calculateStreak()} {t("dailyIbadah.daysStreak")}
                </p>
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-emerald-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 text-emerald-700">
              <Check size={24} className="text-emerald-600" />
              <div>
                <h3 className="font-semibold">Completion Rate</h3>
                <p className="text-2xl font-bold">
                  {calculateCompletionRate()}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* History Table */}
        {history && history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("dailyIbadah.date")}
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("dailyIbadah.prayers.fajr")}
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("dailyIbadah.prayers.dhuhr")}
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("dailyIbadah.prayers.asr")}
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("dailyIbadah.prayers.maghrib")}
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("dailyIbadah.prayers.isha")}
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("dailyIbadah.prayers.tarawih")}
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("dailyIbadah.prayers.tahajjud")}
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("dailyIbadah.dhikr")}
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("dailyIbadah.charity")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((day) => (
                  <tr key={day.date} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {format(parseISO(day.date), "MMM dd, yyyy")}
                    </td>
                    {[
                      "fajr",
                      "dhuhr",
                      "asr",
                      "maghrib",
                      "isha",
                      "tarawih",
                      "tahajjud",
                      "dhikr",
                      "charity",
                    ].map((activity) => (
                      <td key={activity} className="px-3 py-2 text-center">
                        {day[activity as keyof DailyIbadah] ? (
                          <Check
                            size={16}
                            className="text-emerald-600 mx-auto"
                          />
                        ) : (
                          <span className="block w-4 h-4 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No history available for the selected period
          </div>
        )}
      </div>
    </div>
  );
}
