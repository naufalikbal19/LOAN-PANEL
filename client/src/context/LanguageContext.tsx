"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { type Lang, translations } from "@/lib/translations";

interface LanguageCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<LanguageCtx>({ lang: "ms", setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ms");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored && ["ms", "en", "zh"].includes(stored)) setLangState(stored);
    setMounted(true);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  const t = (key: string): string => translations[lang][key] ?? translations["ms"][key] ?? key;

  if (!mounted) return <>{children}</>;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useLanguage = () => useContext(Ctx);
