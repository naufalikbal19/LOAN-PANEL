"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface SiteSettings {
  company_name: string;
  company_tagline: string;
  logo_url: string;
  favicon_url: string;
  support_whatsapp: string;
  support_phone: string;
}

const defaults: SiteSettings = {
  company_name: "Pinjaman Barakah",
  company_tagline: "Pinjaman peribadi terbaik untuk anda",
  logo_url: "",
  favicon_url: "",
  support_whatsapp: "",
  support_phone: "",
};

const SettingsContext = createContext<SiteSettings>(defaults);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaults);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`)
      .then((r) => r.json())
      .then((data) => setSettings({ ...defaults, ...data }))
      .catch(() => {});
  }, []);

  // Update favicon dynamically
  useEffect(() => {
    if (!settings.favicon_url) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = settings.favicon_url;
  }, [settings.favicon_url]);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
