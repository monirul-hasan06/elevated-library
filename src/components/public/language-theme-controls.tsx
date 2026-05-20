"use client";

import { Moon, Sun, Languages } from "lucide-react";
import { useLanguageTheme } from "@/components/shared/language-theme-provider";

export function LanguageThemeControls() {
  const { lang, setLang, theme, setTheme } = useLanguageTheme();
  const isDark = theme === "dark";
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLang(lang === "bn_mix" ? "en" : "bn_mix")}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        type="button"
      >
        <Languages className="h-4 w-4" /> {lang === "bn_mix" ? "BN-EN" : "English"}
      </button>
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="inline-flex items-center rounded-full border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        type="button"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </div>
  );
}
