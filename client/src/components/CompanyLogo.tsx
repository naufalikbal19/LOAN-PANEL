"use client";
import { useSettings } from "@/context/SettingsContext";

interface Props {
  size?: number;
  fontSize?: number;
}

export default function CompanyLogo({ size = 90, fontSize = 9 }: Props) {
  const { company_name, logo_url } = useSettings();

  const initials = company_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (logo_url) {
    return (
      <div style={{ width: size, height: size, borderRadius: size * 0.24, border: "1px solid var(--border-light)", overflow: "hidden", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-card)", flexShrink: 0 }}>
        <img src={logo_url} alt={company_name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }} />
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size, background: "var(--bg-card)", borderRadius: size * 0.24, border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-card)", gap: 2, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: size * 0.045, marginBottom: size * 0.045 }}>
        <div style={{ width: size * 0.09, height: size * 0.18, background: "var(--accent-gold)", borderRadius: 3, opacity: 0.7 }} />
        <div style={{ width: size * 0.09, height: size * 0.27, background: "var(--accent-gold)", borderRadius: 3 }} />
        <div style={{ width: size * 0.09, height: size * 0.22, background: "var(--accent-gold-light)", borderRadius: 3, opacity: 0.85 }} />
      </div>
      <span style={{ fontSize, fontWeight: 800, color: "white", letterSpacing: 0.5, textAlign: "center", lineHeight: 1.2, padding: "0 6px" }}>
        {initials || company_name.slice(0, 8).toUpperCase()}
      </span>
    </div>
  );
}
