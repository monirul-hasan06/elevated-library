"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Lang, ThemeMode } from "@/types";

type Ctx = {
  lang: Lang;
  setLang: (v: Lang) => void;
  theme: ThemeMode;
  setTheme: (v: ThemeMode) => void;
};

const Context = createContext<Ctx | null>(null);

export function LanguageThemeProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn_mix");
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    const storedLang = localStorage.getItem("el_lang") as Lang | null;
    const storedTheme = localStorage.getItem("el_theme") as ThemeMode | null;
    if (storedLang === "bn_mix" || storedLang === "en") setLangState(storedLang);
    if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") setThemeState(storedTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldDark = theme === "dark" || (theme === "system" && prefersDark);
    root.classList.toggle("dark", shouldDark);
    localStorage.setItem("el_theme", theme);
  }, [theme]);

  function setLang(v: Lang) {
    setLangState(v);
    localStorage.setItem("el_lang", v);
  }

  function setTheme(v: ThemeMode) {
    setThemeState(v);
  }

  const value = useMemo(() => ({ lang, setLang, theme, setTheme }), [lang, theme]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useLanguageTheme() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useLanguageTheme must be used inside LanguageThemeProvider");
  return ctx;
}

export function T({ bn, en, className }: { bn?: string | null; en?: string | null; className?: string }) {
  const { lang } = useLanguageTheme();
  return <span className={className}>{lang === "en" ? en || bn : bn || en}</span>;
}
