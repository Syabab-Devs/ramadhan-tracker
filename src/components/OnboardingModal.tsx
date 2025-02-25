import React from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { saveSettings, DEFAULT_QURAN_PAGES } from "../lib/db";
import { Book, Globe, Calendar, X } from "lucide-react";

export default function OnboardingModal({ onClose }: { onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [step, setStep] = React.useState(1);
  const totalSteps = 3;

  // Form state
  const [formData, setFormData] = React.useState({
    language: "en",
    totalPages: DEFAULT_QURAN_PAGES,
    ramadhanEndDate: "2025-03-31",
  });

  const mutation = useMutation({
    mutationFn: async (settings: typeof formData) => {
      await Promise.all([
        saveSettings("language", settings.language),
        saveSettings("totalQuranPages", settings.totalPages),
        saveSettings("ramadhanEndDate", settings.ramadhanEndDate),
        saveSettings("onboardingCompleted", true),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      i18n.changeLanguage(formData.language);
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {t("onboarding.welcome")}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step indicators */}
            <div className="flex gap-2 mb-6">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full ${
                    index + 1 <= step ? "bg-emerald-600" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Step 1: Language */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="text-emerald-600" size={24} />
                  <h3 className="text-lg font-medium">
                    {t("onboarding.selectLanguage")}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  {t("onboarding.languageDescription")}
                </p>
                <select
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="en">English</option>
                  <option value="id">Indonesian</option>
                </select>
              </div>
            )}

            {/* Step 2: Quran Pages */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Book className="text-emerald-600" size={24} />
                  <h3 className="text-lg font-medium">
                    {t("onboarding.quranPages")}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  {t("settings.totalQuranPagesHelp")}
                </p>
                <input
                  type="number"
                  min="1"
                  value={formData.totalPages}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalPages: Math.max(
                        1,
                        parseInt(e.target.value) || DEFAULT_QURAN_PAGES
                      ),
                    })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            )}

            {/* Step 3: Ramadhan End Date */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-emerald-600" size={24} />
                  <h3 className="text-lg font-medium">
                    {t("onboarding.ramadhanEndDate")}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  {t("settings.ramadhanEndDateHelp")}
                </p>
                <input
                  type="date"
                  value={formData.ramadhanEndDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ramadhanEndDate: e.target.value,
                    })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handleBack}
                className={`px-4 py-2 rounded-md text-gray-600 ${
                  step === 1
                    ? "invisible"
                    : "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                }`}
              >
                {t("onboarding.back")}
              </button>
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  {t("onboarding.next")}
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  {t("onboarding.finish")}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
