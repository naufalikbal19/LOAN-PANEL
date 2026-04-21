"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface SiteSettings {
  company_name: string;
  company_tagline: string;
  logo_url: string;
  favicon_url: string;
  support_whatsapp: string;
  support_phone: string;
  // Dark mode
  dark_accent: string;
  dark_bg_primary: string; dark_bg_secondary: string;
  dark_bg_card: string;    dark_bg_card_inner: string;
  dark_text_primary: string; dark_text_secondary: string; dark_text_muted: string;
  dark_border_color: string; dark_border_light: string;
  dark_nav_bg: string;     dark_bg_image: string;
  // Light mode
  light_accent: string;
  light_bg_primary: string; light_bg_secondary: string;
  light_bg_card: string;    light_bg_card_inner: string;
  light_text_primary: string; light_text_secondary: string; light_text_muted: string;
  light_border_color: string; light_border_light: string;
  light_nav_bg: string;    light_bg_image: string;
}

const defaults: SiteSettings = {
  company_name: "Pinjaman Barakah",
  company_tagline: "Pinjaman peribadi terbaik untuk anda",
  logo_url: "", favicon_url: "", support_whatsapp: "", support_phone: "",
  dark_accent: "#c9a84c",
  dark_bg_primary: "#080808", dark_bg_secondary: "#0f0f0f",
  dark_bg_card: "#161616",    dark_bg_card_inner: "#1e1e1e",
  dark_text_primary: "#ffffff", dark_text_secondary: "#888888", dark_text_muted: "#484848",
  dark_border_color: "#242424", dark_border_light: "#2e2e2e",
  dark_nav_bg: "#0c0c0c",    dark_bg_image: "",
  light_accent: "#b8882a",
  light_bg_primary: "#f4f4f5", light_bg_secondary: "#e4e4e7",
  light_bg_card: "#ffffff",    light_bg_card_inner: "#f1f1f1",
  light_text_primary: "#111111", light_text_secondary: "#555555", light_text_muted: "#999999",
  light_border_color: "#e0e0e0", light_border_light: "#d4d4d4",
  light_nav_bg: "#ffffff",   light_bg_image: "",
};

const SettingsContext = createContext<SiteSettings>(defaults);

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : null;
}

function adjustColor(hex: string, amt: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const n = parseInt(hex.replace("#",""),16);
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  const r = clamp((n >> 16) + amt);
  const g = clamp(((n >> 8) & 0xff) + amt);
  const b = clamp((n & 0xff) + amt);
  return `#${((r << 16)|(g << 8)|b).toString(16).padStart(6,"0")}`;
}

export function applyThemeVars(s: SiteSettings, theme: "dark" | "light") {
  const p = theme === "dark" ? "dark" : "light";
  const root = document.documentElement;
  const v = (key: keyof SiteSettings) => (s[key] as string) || "";

  const accent = v(`${p}_accent` as keyof SiteSettings);
  root.style.setProperty("--accent-blue",       accent || (p === "dark" ? "#c9a84c" : "#b8882a"));
  root.style.setProperty("--accent-gold",        accent || (p === "dark" ? "#c9a84c" : "#b8882a"));
  root.style.setProperty("--accent-blue-light",  adjustColor(accent || "#c9a84c", 25));
  root.style.setProperty("--accent-blue-hover",  adjustColor(accent || "#c9a84c", -20));
  const rgb = hexToRgb(accent);
  if (rgb) root.style.setProperty("--shadow-button", `0 4px 20px rgba(${rgb},0.35)`);

  root.style.setProperty("--bg-primary",    v(`${p}_bg_primary`    as keyof SiteSettings) || (p==="dark"?"#080808":"#f4f4f5"));
  root.style.setProperty("--bg-secondary",  v(`${p}_bg_secondary`  as keyof SiteSettings) || (p==="dark"?"#0f0f0f":"#e4e4e7"));
  root.style.setProperty("--bg-card",       v(`${p}_bg_card`       as keyof SiteSettings) || (p==="dark"?"#161616":"#ffffff"));
  root.style.setProperty("--bg-card-inner", v(`${p}_bg_card_inner` as keyof SiteSettings) || (p==="dark"?"#1e1e1e":"#f1f1f1"));
  root.style.setProperty("--text-primary",  v(`${p}_text_primary`  as keyof SiteSettings) || (p==="dark"?"#ffffff":"#111111"));
  root.style.setProperty("--text-secondary",v(`${p}_text_secondary`as keyof SiteSettings) || (p==="dark"?"#888888":"#555555"));
  root.style.setProperty("--text-muted",    v(`${p}_text_muted`    as keyof SiteSettings) || (p==="dark"?"#484848":"#999999"));
  root.style.setProperty("--border-color",  v(`${p}_border_color`  as keyof SiteSettings) || (p==="dark"?"#242424":"#e0e0e0"));
  root.style.setProperty("--border-light",  v(`${p}_border_light`  as keyof SiteSettings) || (p==="dark"?"#2e2e2e":"#d4d4d4"));
  root.style.setProperty("--nav-bg",        v(`${p}_nav_bg`        as keyof SiteSettings) || (p==="dark"?"#0c0c0c":"#ffffff"));

  // Background image
  const shell = document.querySelector<HTMLElement>(".app-shell");
  if (shell) {
    const img = v(`${p}_bg_image` as keyof SiteSettings);
    shell.style.backgroundImage = img ? `url('${img}')` : "";
    shell.style.backgroundSize     = img ? "cover" : "";
    shell.style.backgroundPosition = img ? "center" : "";
    shell.style.backgroundAttachment = img ? "fixed" : "";
  }
}

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
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = settings.favicon_url;
  }, [settings.favicon_url]);

  // Apply CSS vars on settings load + on theme-change event
  useEffect(() => {
    const theme = (localStorage.getItem("theme") as "dark" | "light") || "dark";
    applyThemeVars(settings, theme);

    const handler = (e: Event) => {
      const t = (e as CustomEvent<"dark"|"light">).detail;
      applyThemeVars(settings, t);
    };
    window.addEventListener("themechange", handler);
    return () => window.removeEventListener("themechange", handler);
  }, [settings]);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
