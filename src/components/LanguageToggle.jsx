import { Languages } from "lucide-react";
import { useTranslation } from "../contexts/LanguageContext";

export function LanguageToggle() {
  const { lang, toggleLang } = useTranslation();
  return (
    <button
      onClick={toggleLang}
      title={lang === "en" ? "日本語に切り替え" : "Switch to English"}
      className="fixed bottom-4 right-32 z-50 flex items-center gap-1.5 text-xs px-3 py-2 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 shadow-lg hover:bg-zinc-700 transition"
    >
      <Languages className="w-3.5 h-3.5" />
      {lang === "en" ? "日本語" : "English"}
    </button>
  );
}