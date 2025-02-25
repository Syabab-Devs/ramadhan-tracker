import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Book, Calendar, Settings, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import QuranTracker from "./components/QuranTracker";
import DailyIbadah from "./components/DailyIbadah";
import IbadahHistory from "./components/IbadahHistory";
import SettingsPanel from "./components/SettingsPanel";
import OnboardingModal from "./components/OnboardingModal";
import { getSetting } from "./lib/db";
import "./i18n";
import i18n from "./i18n";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      // Ensure queries always return a value
      placeholderData: (previousData: any) => previousData ?? null,
    },
  },
});

function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState("quran");
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const { data: language = i18n.language || "en" } = useQuery({
    queryKey: ["settings", "language"],
    queryFn: async () => {
      const data = await getSetting("language");
      return data || i18n.language || "en";
    },
  });

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);
  // Language

  // Check if onboarding is completed
  useQuery({
    queryKey: ["settings", "onboardingCompleted"],
    queryFn: async () => {
      const completed = await getSetting("onboardingCompleted");
      if (completed === undefined) {
        setShowOnboarding(true);
      }
      return completed ?? false;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-600 text-white p-4">
        <h1 className="text-2xl font-bold text-center">{t("appName")}</h1>
      </header>

      <main className="container mx-auto px-4 pt-6 max-w-2xl pb-24">
        {activeTab === "quran" && <QuranTracker />}
        {activeTab === "ibadah" && <DailyIbadah />}
        {activeTab === "history" && <IbadahHistory />}
        {activeTab === "settings" && <SettingsPanel />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container mx-auto max-w-2xl">
          <div className="flex justify-around p-4">
            <button
              onClick={() => setActiveTab("quran")}
              className={`flex flex-col items-center ${
                activeTab === "quran" ? "text-emerald-600" : "text-gray-600"
              }`}
            >
              <Book size={24} />
              <span className="text-sm mt-1">{t("quranTracker.title")}</span>
            </button>
            <button
              onClick={() => setActiveTab("ibadah")}
              className={`flex flex-col items-center ${
                activeTab === "ibadah" ? "text-emerald-600" : "text-gray-600"
              }`}
            >
              <Calendar size={24} />
              <span className="text-sm mt-1">{t("dailyIbadah.title")}</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex flex-col items-center ${
                activeTab === "history" ? "text-emerald-600" : "text-gray-600"
              }`}
            >
              <History size={24} />
              <span className="text-sm mt-1">
                {t("dailyIbadah.historyTitle")}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex flex-col items-center ${
                activeTab === "settings" ? "text-emerald-600" : "text-gray-600"
              }`}
            >
              <Settings size={24} />
              <span className="text-sm mt-1">{t("settings.title")}</span>
            </button>
          </div>
        </div>
      </nav>

      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}

// Wrap the app with the query client provider
export default function AppWithProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
