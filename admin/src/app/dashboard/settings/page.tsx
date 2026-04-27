"use client";
import { useEffect, useState } from "react";
import { Save, Image, Globe, Phone, MessageCircle, FileText, Palette, Moon, Sun } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL!;

// ─── All settings keys ────────────────────────────────────────────────────────
interface Settings {
  company_name: string; company_tagline: string;
  logo_url: string; favicon_url: string;
  support_phone: string; support_whatsapp: string;
  withdrawal_warning: string;
  keterangan_under_review: string; keterangan_loan_approved: string;
  keterangan_credit_frozen: string; keterangan_unfrozen_processing: string;
  keterangan_credit_score_low: string; keterangan_payment_processing: string;
  keterangan_loan_being_canceled: string;
  keterangan_transfer_failed: string;
  // Diiktiraf Oleh
  diiktiraf_img_1: string; diiktiraf_img_2: string;
  diiktiraf_img_3: string; diiktiraf_img_4: string;
  // Kaedah Pembayaran
  payment_img_1: string; payment_img_2: string; payment_img_3: string;
  payment_img_4: string; payment_img_5: string; payment_img_6: string;
  // Dark
  dark_accent: string;
  dark_bg_primary: string; dark_bg_secondary: string;
  dark_bg_card: string;    dark_bg_card_inner: string;
  dark_text_primary: string; dark_text_secondary: string; dark_text_muted: string;
  dark_border_color: string; dark_border_light: string;
  dark_nav_bg: string;     dark_bg_image: string;
  // Light
  light_accent: string;
  light_bg_primary: string; light_bg_secondary: string;
  light_bg_card: string;    light_bg_card_inner: string;
  light_text_primary: string; light_text_secondary: string; light_text_muted: string;
  light_border_color: string; light_border_light: string;
  light_nav_bg: string;    light_bg_image: string;
}

const DEFAULTS: Settings = {
  company_name: "", company_tagline: "", logo_url: "", favicon_url: "",
  support_phone: "", support_whatsapp: "",
  withdrawal_warning: "⚠ Pengeluaran hanya tersedia selepas pinjaman diluluskan",
  keterangan_under_review: "", keterangan_loan_approved: "", keterangan_credit_frozen: "",
  keterangan_unfrozen_processing: "", keterangan_credit_score_low: "",
  keterangan_payment_processing: "", keterangan_loan_being_canceled: "", keterangan_transfer_failed: "",
  diiktiraf_img_1: "", diiktiraf_img_2: "", diiktiraf_img_3: "", diiktiraf_img_4: "",
  payment_img_1: "", payment_img_2: "", payment_img_3: "",
  payment_img_4: "", payment_img_5: "", payment_img_6: "",
  dark_accent: "#c9a84c",
  dark_bg_primary: "#080808", dark_bg_secondary: "#0f0f0f",
  dark_bg_card: "#161616",    dark_bg_card_inner: "#1e1e1e",
  dark_text_primary: "#ffffff", dark_text_secondary: "#888888", dark_text_muted: "#484848",
  dark_border_color: "#242424", dark_border_light: "#2e2e2e",
  dark_nav_bg: "#0c0c0c",     dark_bg_image: "",
  light_accent: "#b8882a",
  light_bg_primary: "#f4f4f5", light_bg_secondary: "#e4e4e7",
  light_bg_card: "#ffffff",    light_bg_card_inner: "#f1f1f1",
  light_text_primary: "#111111", light_text_secondary: "#555555", light_text_muted: "#999999",
  light_border_color: "#e0e0e0", light_border_light: "#d4d4d4",
  light_nav_bg: "#ffffff",    light_bg_image: "",
};

// ─── Theme variable groups ───────────────────────────────────────────────────
const THEME_GROUPS = [
  {
    title: "Warna Aksen",
    vars: [
      { key: "accent",         label: "Warna Aksen (Gold)",    hint: "Butang, border aktif, badge, teks highlighted" },
    ],
  },
  {
    title: "Warna Teks",
    vars: [
      { key: "text_primary",   label: "Teks Utama (Title)",    hint: "Judul, nama, angka penting" },
      { key: "text_secondary", label: "Teks Sekunder",         hint: "Label, keterangan, subtitle" },
      { key: "text_muted",     label: "Teks Pudar (Muted)",    hint: "Placeholder, teks tidak aktif" },
    ],
  },
  {
    title: "Warna Latar Belakang",
    vars: [
      { key: "bg_primary",     label: "Latar Utama",           hint: "Background halaman utama" },
      { key: "bg_secondary",   label: "Latar Sekunder",        hint: "Background bahagian sekunder" },
      { key: "bg_card",        label: "Latar Kad",             hint: "Background card & panel" },
      { key: "bg_card_inner",  label: "Latar Dalam Kad",       hint: "Background input, inner section" },
      { key: "nav_bg",         label: "Latar Bottom Nav",      hint: "Background navigasi bawah" },
    ],
  },
  {
    title: "Warna Border",
    vars: [
      { key: "border_color",   label: "Border Utama",          hint: "Garisan sempadan kad" },
      { key: "border_light",   label: "Border Ringan",         hint: "Garisan sempadan halus" },
    ],
  },
];

const KETERANGAN_FIELDS: { key: keyof Settings; label: string; badgeBg: string; badgeColor: string }[] = [
  { key: "keterangan_under_review",        label: "Under Review",        badgeBg: "rgba(201,168,76,0.15)",  badgeColor: "#c9a84c" },
  { key: "keterangan_loan_approved",       label: "Loan Approved",       badgeBg: "rgba(34,197,94,0.12)",  badgeColor: "#22c55e" },
  { key: "keterangan_credit_frozen",       label: "Credit Frozen",       badgeBg: "rgba(239,68,68,0.12)",  badgeColor: "#ef4444" },
  { key: "keterangan_unfrozen_processing", label: "Unfrozen Processing", badgeBg: "rgba(251,146,60,0.12)", badgeColor: "#fb923c" },
  { key: "keterangan_credit_score_low",    label: "Credit Score Low",    badgeBg: "rgba(239,68,68,0.08)",  badgeColor: "#f87171" },
  { key: "keterangan_payment_processing",  label: "Payment Processing",  badgeBg: "rgba(99,102,241,0.12)", badgeColor: "#818cf8" },
  { key: "keterangan_loan_being_canceled", label: "Loan Being Canceled", badgeBg: "rgba(107,114,128,0.12)",badgeColor: "#9ca3af" },
  { key: "keterangan_transfer_failed",     label: "Transfer Failed",     badgeBg: "rgba(239,68,68,0.12)",  badgeColor: "#ef4444" },
];

type SaveStatus = "idle" | "saving" | "success" | "error";
type ThemeTab = "dark" | "light";

// ─── Sub-components ──────────────────────────────────────────────────────────
function ColorRow({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  const isValid = /^#[0-9a-fA-F]{6}$/.test(value);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--bg-card)" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <input
          type="color"
          value={isValid ? value : "#888888"}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid var(--border-light)", cursor: "pointer", padding: 2, background: "none" }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{hint}</p>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={7}
        placeholder="#000000"
        style={{
          width: 90, background: "var(--bg-card)",
          border: `1px solid ${isValid ? "var(--border-light)" : "#ef4444"}`,
          borderRadius: 8, padding: "7px 10px", color: "var(--text-primary)",
          fontSize: 13, outline: "none", fontFamily: "monospace", textAlign: "center",
        }}
      />
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [themeTab, setThemeTab] = useState<ThemeTab>("dark");
  const [focusedField, setFocusedField] = useState<keyof Settings | null>(null);

  useEffect(() => {
    fetch(`${API}/settings`)
      .then((r) => r.json())
      .then((data) => { setSettings({ ...DEFAULTS, ...data }); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = (key: keyof Settings) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSettings((p) => ({ ...p, [key]: e.target.value }));
      if (status !== "idle") setStatus("idle");
    };

  const setColor = (key: keyof Settings) => (v: string) => {
    setSettings((p) => ({ ...p, [key]: v }));
    if (status !== "idle") setStatus("idle");
  };

  const handleResetTheme = () => {
    const prefix = themeTab;
    const themeKeys = Object.keys(DEFAULTS).filter((k) => k.startsWith(`${prefix}_`)) as (keyof Settings)[];
    setSettings((prev) => {
      const next = { ...prev };
      themeKeys.forEach((k) => { (next as any)[k] = (DEFAULTS as any)[k]; });
      return next;
    });
    if (status !== "idle") setStatus("idle");
  };

  const handleSave = async () => {
    setStatus("saving"); setErrorMsg("");
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus("error"); setErrorMsg(data.message || "Gagal menyimpan."); return; }
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error"); setErrorMsg("Ralat sambungan. Sila cuba semula.");
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-card-inner)", border: "1px solid var(--border-light)", borderRadius: 10,
    padding: "12px 14px", color: "var(--text-primary)", fontSize: 14, width: "100%",
    outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
  };
  const focusedInputStyle = (key: keyof Settings): React.CSSProperties => ({
    ...inputStyle, border: `1px solid ${focusedField === key ? "#c9a84c" : "var(--border-light)"}`,
  });

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, color: "var(--text-secondary)" }}>Memuatkan tetapan...</div>
  );

  const p = themeTab; // "dark" | "light"

  return (
    <div style={{ maxWidth: 740 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Konfigurasi maklumat, rupa syarikat, dan tema klien</p>
      </div>

      {/* ── Company ── */}
      <section style={card}>
        <h2 style={sectionTitle}><Globe size={13} style={iconInline} />Maklumat Syarikat</h2>
        <Field label="Nama Syarikat" icon={Globe}>
          <input value={settings.company_name} onChange={set("company_name")} placeholder="Pinjaman Barakah" style={focusedInputStyle("company_name")} onFocus={() => setFocusedField("company_name")} onBlur={() => setFocusedField(null)} />
        </Field>
        <Field label="Tagline">
          <input value={settings.company_tagline} onChange={set("company_tagline")} placeholder="Pinjaman peribadi terbaik..." style={focusedInputStyle("company_tagline")} onFocus={() => setFocusedField("company_tagline")} onBlur={() => setFocusedField(null)} />
        </Field>
      </section>

      {/* ── Logo ── */}
      <section style={card}>
        <h2 style={sectionTitle}><Image size={13} style={iconInline} />Logo & Favicon</h2>
        <Field label="URL Logo" icon={Image}>
          <input value={settings.logo_url} onChange={set("logo_url")} placeholder="https://..." style={focusedInputStyle("logo_url")} onFocus={() => setFocusedField("logo_url")} onBlur={() => setFocusedField(null)} />
        </Field>
        {settings.logo_url && (
          <div style={{ marginBottom: 16, padding: 10, background: "var(--bg-card)", borderRadius: 8, display: "inline-block" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={settings.logo_url} alt="logo" style={{ height: 44, objectFit: "contain" }} onError={(e) => ((e.target as HTMLImageElement).style.display="none")} />
          </div>
        )}
        <Field label="URL Favicon" icon={Image}>
          <input value={settings.favicon_url} onChange={set("favicon_url")} placeholder="https://..." style={focusedInputStyle("favicon_url")} onFocus={() => setFocusedField("favicon_url")} onBlur={() => setFocusedField(null)} />
        </Field>
      </section>

      {/* ── Support ── */}
      <section style={card}>
        <h2 style={sectionTitle}><Phone size={13} style={iconInline} />Maklumat Sokongan</h2>
        <Field label="Nombor Telefon" icon={Phone}>
          <input value={settings.support_phone} onChange={set("support_phone")} placeholder="+60123456789" style={focusedInputStyle("support_phone")} onFocus={() => setFocusedField("support_phone")} onBlur={() => setFocusedField(null)} />
        </Field>
        <Field label="WhatsApp" icon={MessageCircle}>
          <input value={settings.support_whatsapp} onChange={set("support_whatsapp")} placeholder="60123456789" style={focusedInputStyle("support_whatsapp")} onFocus={() => setFocusedField("support_whatsapp")} onBlur={() => setFocusedField(null)} />
        </Field>
      </section>

      {/* ── Teks Amaran Pengeluaran ── */}
      <section style={card}>
        <h2 style={sectionTitle}><FileText size={13} style={iconInline} />Teks Amaran Pengeluaran</h2>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>Teks amaran yang dipaparkan kepada klien apabila pinjaman belum diluluskan. Kosongkan untuk sembunyikan amaran.</p>
        <Field label="Teks Amaran">
          <input
            value={settings.withdrawal_warning}
            onChange={set("withdrawal_warning")}
            placeholder="⚠ Pengeluaran hanya tersedia selepas pinjaman diluluskan"
            style={focusedInputStyle("withdrawal_warning")}
            onFocus={() => setFocusedField("withdrawal_warning")}
            onBlur={() => setFocusedField(null)}
          />
        </Field>
        {settings.withdrawal_warning && (
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10, padding: "10px 14px", marginTop: 4 }}>
            <p style={{ fontSize: 12, color: "#f59e0b", margin: 0 }}>{settings.withdrawal_warning}</p>
          </div>
        )}
      </section>

      {/* ── Tema Klien ── */}
      <section style={card}>
        <h2 style={sectionTitle}><Palette size={13} style={iconInline} />Tema Klien</h2>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 20 }}>
          Kustomisasi warna aplikasi klien untuk Dark Mode dan Light Mode secara berasingan. Perubahan aktif serta-merta selepas disimpan.
        </p>

        {/* Tab switcher + Reset */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, background: "var(--bg-card)", borderRadius: 12, padding: 4 }}>
            {(["dark","light"] as ThemeTab[]).map((t) => (
              <button key={t} onClick={() => setThemeTab(t)} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer",
                fontFamily: "inherit", fontWeight: 700, fontSize: 13,
                background: themeTab === t ? (t === "dark" ? "#2a2a2a" : "#fff") : "transparent",
                color: themeTab === t ? (t === "dark" ? "#c9a84c" : "#333") : "var(--text-secondary)",
                boxShadow: themeTab === t ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
                transition: "all 0.2s",
              }}>
                {t === "dark" ? <Moon size={14} /> : <Sun size={14} />}
                {t === "dark" ? "Dark Mode" : "Light Mode"}
              </button>
            ))}
          </div>
          <button
            onClick={handleResetTheme}
            title={`Reset warna ${themeTab === "dark" ? "Dark" : "Light"} Mode ke default`}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 16px", borderRadius: 9, border: "1px solid var(--border-light)",
              background: "var(--bg-card)", color: "var(--text-secondary)", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 600, fontSize: 12,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-light)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
          >
            ↺ Reset {themeTab === "dark" ? "Dark" : "Light"} ke Default
          </button>
        </div>

        {/* Color groups */}
        {THEME_GROUPS.map((group) => (
          <div key={group.title} style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#c9a84c", marginBottom: 4 }}>{group.title}</p>
            <div style={{ background: "var(--bg-primary)", borderRadius: 12, border: "1px solid var(--border-color)", padding: "0 14px" }}>
              {group.vars.map(({ key, label, hint }) => {
                const fullKey = `${p}_${key}` as keyof Settings;
                return (
                  <ColorRow key={fullKey} label={label} hint={hint} value={settings[fullKey] as string} onChange={setColor(fullKey)} />
                );
              })}
            </div>
          </div>
        ))}

        {/* Background image */}
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#c9a84c", marginBottom: 8 }}>Gambar Latar Belakang</p>
          <input
            type="text"
            value={settings[`${p}_bg_image` as keyof Settings] as string}
            onChange={set(`${p}_bg_image` as keyof Settings)}
            placeholder="https://... (kosongkan untuk tiada gambar)"
            style={{ ...inputStyle, marginBottom: 10 }}
          />
          {(settings[`${p}_bg_image` as keyof Settings] as string) && (
            <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--border-light)", height: 90, position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={settings[`${p}_bg_image` as keyof Settings] as string} alt="bg preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => ((e.target as HTMLImageElement).style.display="none")} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 11, color: "white", fontWeight: 600 }}>Preview Latar</span>
              </div>
            </div>
          )}
        </div>

        {/* Phone mockup preview */}
        <ThemePreview s={settings} p={p} />
      </section>

      {/* ── Keterangan Templates ── */}
      <section style={card}>
        <h2 style={sectionTitle}><FileText size={13} style={iconInline} />Template Keterangan Pinjaman</h2>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 20 }}>Teks ini auto-diisi apabila status pinjaman ditukar. Staff boleh edit secara manual.</p>
        {KETERANGAN_FIELDS.map(({ key, label, badgeBg, badgeColor }) => (
          <div key={key} style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={11} />
              <span style={{ background: badgeBg, color: badgeColor, padding: "2px 8px", borderRadius: 8, fontSize: 10, fontWeight: 700 }}>{label}</span>
            </label>
            <textarea
              value={settings[key]}
              onChange={set(key)}
              onFocus={() => setFocusedField(key)}
              onBlur={() => setFocusedField(null)}
              rows={3}
              style={{ background: "var(--bg-card-inner)", border: `1px solid ${focusedField === key ? "#c9a84c" : "var(--border-light)"}`, borderRadius: 10, padding: "12px 14px", color: "var(--text-primary)", fontSize: 13, width: "100%", outline: "none", fontFamily: "inherit", resize: "vertical", lineHeight: 1.6, transition: "border-color 0.2s", boxSizing: "border-box" }}
            />
          </div>
        ))}
      </section>

      {/* ── Gambar Diiktiraf Oleh ── */}
      <section style={card}>
        <h2 style={sectionTitle}><Image size={13} style={iconInline} />Gambar "Diiktiraf Oleh" (Footer Dashboard Klien)</h2>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 20 }}>
          Sehingga 4 gambar (logo/badge) yang dipaparkan di bahagian bawah dashboard klien. Kosongkan slot untuk sembunyikan. Gunakan URL gambar (PNG/JPG/SVG).
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {([
            { key: "diiktiraf_img_1" as keyof Settings, label: "Gambar 1" },
            { key: "diiktiraf_img_2" as keyof Settings, label: "Gambar 2" },
            { key: "diiktiraf_img_3" as keyof Settings, label: "Gambar 3" },
            { key: "diiktiraf_img_4" as keyof Settings, label: "Gambar 4" },
          ] as { key: keyof Settings; label: string }[]).map(({ key, label }) => (
            <div key={key}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" as const, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>{label}</label>
              <input
                value={settings[key] as string}
                onChange={set(key)}
                placeholder="https://... atau /uploads/..."
                style={focusedInputStyle(key)}
                onFocus={() => setFocusedField(key)}
                onBlur={() => setFocusedField(null)}
              />
              {(settings[key] as string) && (
                <div style={{ marginTop: 8, background: "var(--bg-card)", borderRadius: 8, padding: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings[key] as string} alt={label} style={{ height: 40, maxWidth: 80, objectFit: "contain" }} onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Kaedah Pembayaran ── */}
      <section style={card}>
        <h2 style={sectionTitle}><Image size={13} style={iconInline} />Gambar Kaedah Pembayaran (Wallet Klien)</h2>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 20 }}>
          Sehingga 6 gambar kaedah pembayaran yang dipaparkan di bahagian bawah halaman Wallet klien. Kosongkan slot untuk sembunyikan. Gunakan URL gambar dari Media atau URL luaran.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {([
            { key: "payment_img_1" as keyof Settings, label: "Pembayaran 1" },
            { key: "payment_img_2" as keyof Settings, label: "Pembayaran 2" },
            { key: "payment_img_3" as keyof Settings, label: "Pembayaran 3" },
            { key: "payment_img_4" as keyof Settings, label: "Pembayaran 4" },
            { key: "payment_img_5" as keyof Settings, label: "Pembayaran 5" },
            { key: "payment_img_6" as keyof Settings, label: "Pembayaran 6" },
          ] as { key: keyof Settings; label: string }[]).map(({ key, label }) => (
            <div key={key}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" as const, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>{label}</label>
              <input
                value={settings[key] as string}
                onChange={set(key)}
                placeholder="https://... atau /uploads/..."
                style={focusedInputStyle(key)}
                onFocus={() => setFocusedField(key)}
                onBlur={() => setFocusedField(null)}
              />
              {(settings[key] as string) && (
                <div style={{ marginTop: 8, background: "var(--bg-card)", borderRadius: 8, padding: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings[key] as string} alt={label} style={{ height: 40, maxWidth: 80, objectFit: "contain" }} onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Status */}
      {status === "error" && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#ef4444", fontSize: 13 }}>{errorMsg}</div>
      )}
      {status === "success" && (
        <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#22c55e", fontSize: 13 }}>✓ Tetapan berjaya disimpan.</div>
      )}

      <button
        onClick={handleSave}
        disabled={status === "saving"}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "#c9a84c", color: "#000", border: "none", borderRadius: 10, padding: "13px 28px", fontSize: 14, fontWeight: 700, cursor: status === "saving" ? "not-allowed" : "pointer", opacity: status === "saving" ? 0.7 : 1, fontFamily: "inherit", marginBottom: 40 }}
      >
        <Save size={16} /> {status === "saving" ? "Menyimpan..." : "Simpan Semua Tetapan"}
      </button>
    </div>
  );
}

// ─── Phone mockup preview ─────────────────────────────────────────────────────
type PreviewPage = "dashboard" | "dompet" | "akaun" | "mohon";

function ThemePreview({ s, p }: { s: Settings; p: string }) {
  const [page, setPage] = useState<PreviewPage>("dompet");

  const c = (key: string) => (s as any)[`${p}_${key}`] || "";
  const accent      = c("accent")        || "#c9a84c";
  const bgPrimary   = c("bg_primary")    || "#080808";
  const bgSecondary = c("bg_secondary")  || "#0f0f0f";
  const bgCard      = c("bg_card")       || "#161616";
  const bgCardInner = c("bg_card_inner") || "#1e1e1e";
  const navBg       = c("nav_bg")        || "#0c0c0c";
  const textPrimary = c("text_primary")  || "#ffffff";
  const textSecond  = c("text_secondary")|| "#888888";
  const textMuted   = c("text_muted")    || "#484848";
  const borderColor = c("border_color")  || "#242424";
  const borderLight = c("border_light")  || "#2e2e2e";
  const bgImage     = c("bg_image")      || "";

  const pages: { id: PreviewPage; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "dompet",    label: "Dompet",    icon: "💳" },
    { id: "akaun",     label: "Akaun",     icon: "👤" },
    { id: "mohon",     label: "Mohon",     icon: "📋" },
  ];

  const activeNavIdx = { dashboard: 0, dompet: 1, akaun: 3, mohon: 0 }[page];

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return (
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ padding: "14px 14px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 7, color: textSecond, margin: 0 }}>Selamat Datang 👋</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: textPrimary, margin: 0 }}>Ahmad Fauzi</p>
              </div>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 12 }}>👤</span>
              </div>
            </div>
            {/* Balance card */}
            <div style={{ margin: "0 10px 10px", background: `linear-gradient(135deg, ${bgCardInner} 0%, ${bgPrimary} 100%)`, border: `1px solid ${borderLight}`, borderRadius: 14, padding: "14px" }}>
              <p style={{ fontSize: 7, color: textMuted, margin: "0 0 3px", letterSpacing: 0.5 }}>BAKI SEMASA</p>
              <p style={{ fontSize: 20, fontWeight: 900, color: textPrimary, margin: "0 0 10px", letterSpacing: -0.5 }}>RM 25,000.00</p>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ flex: 1, background: bgCardInner, borderRadius: 8, padding: "7px 8px" }}>
                  <p style={{ fontSize: 6, color: textMuted, margin: 0 }}>STATUS</p>
                  <p style={{ fontSize: 8, fontWeight: 700, color: "#22c55e", margin: 0 }}>Diluluskan</p>
                </div>
                <div style={{ flex: 1, background: bgCardInner, borderRadius: 8, padding: "7px 8px" }}>
                  <p style={{ fontSize: 6, color: textMuted, margin: 0 }}>TEMPOH</p>
                  <p style={{ fontSize: 8, fontWeight: 700, color: textPrimary, margin: 0 }}>24 Bulan</p>
                </div>
              </div>
            </div>
            {/* Quick menu 2x2 */}
            <div style={{ padding: "0 10px 10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[["💳","Dompet"], ["📄","Mohon"], ["🎧","Sokongan"], ["👤","Profil"]].map(([icon, label]) => (
                <div key={label} style={{ background: bgCard, border: `1px solid ${borderColor}`, borderRadius: 10, padding: "10px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>
                  <p style={{ fontSize: 8, fontWeight: 600, color: textPrimary, margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>
            {/* Apply button */}
            <div style={{ padding: "0 10px 60px" }}>
              <div style={{ background: accent, borderRadius: 10, padding: "10px 0", textAlign: "center" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#000", margin: 0 }}>Mohon Pinjaman Sekarang</p>
              </div>
            </div>
          </div>
        );

      case "dompet":
        return (
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ padding: "14px 14px 10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 7, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: accent, margin: 0 }}>FINANCIAL OVERVIEW</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: textPrimary, margin: 0 }}>Dompet Saya</p>
              </div>
              <div style={{ fontSize: 6, fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: "3px 7px", display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />VERIFIED
              </div>
            </div>
            {/* Wallet card */}
            <div style={{ margin: "0 10px 10px", background: `linear-gradient(135deg, ${bgCardInner} 0%, ${bgPrimary} 100%)`, border: `1px solid ${borderLight}`, borderRadius: 14, padding: "12px 14px" }}>
              <p style={{ fontSize: 7, color: textMuted, margin: "0 0 4px", letterSpacing: 0.5 }}>AKAUN SAYA</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: textPrimary, margin: "0 0 8px", letterSpacing: -0.5 }}>RM 25,000.00</p>
              <div style={{ background: bgCardInner, borderRadius: 8, padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 7, color: textMuted, margin: 0 }}>Pinjaman Diluluskan</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: textPrimary, margin: 0 }}>RM 25,000</p>
                </div>
                <div style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", borderRadius: 6, padding: "5px 10px" }}>
                  <p style={{ fontSize: 8, fontWeight: 700, color: "white", margin: 0 }}>WITHDRAW</p>
                </div>
              </div>
            </div>
            {/* Payment methods */}
            <div style={{ padding: "0 10px 8px" }}>
              <p style={{ fontSize: 8, fontWeight: 700, color: textSecond, margin: "0 0 6px" }}>Kaedah Pembayaran</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
                {["Boost","GXBank","eWallet"].map((m) => (
                  <div key={m} style={{ background: bgCard, border: `1px solid ${borderColor}`, borderRadius: 8, padding: "7px 4px", textAlign: "center" }}>
                    <p style={{ fontSize: 7, fontWeight: 600, color: textPrimary, margin: 0 }}>{m}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Loan details */}
            <div style={{ padding: "0 10px 60px" }}>
              <p style={{ fontSize: 8, fontWeight: 700, color: textSecond, margin: "0 0 6px" }}>Butiran Pinjaman</p>
              <div style={{ background: bgCard, border: `1px solid ${borderColor}`, borderRadius: 10, padding: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <p style={{ fontSize: 7, color: textMuted, margin: 0 }}>NO. PERMOHONAN</p>
                  <span style={{ fontSize: 6, fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.12)", borderRadius: 5, padding: "2px 5px" }}>Diluluskan</span>
                </div>
                <p style={{ fontSize: 10, fontWeight: 800, color: accent, margin: "0 0 8px" }}>#ORD-00001</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                  {[["Jumlah","RM 25,000"],["Tempoh","24 Bulan"],["Bank","Maybank"],["Akaun","019****19"]].map(([l,v]) => (
                    <div key={l}>
                      <p style={{ fontSize: 6, color: textMuted, margin: 0 }}>{l}</p>
                      <p style={{ fontSize: 8, fontWeight: 600, color: textPrimary, margin: 0 }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "akaun":
        return (
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ padding: "14px 14px 10px" }}>
              <p style={{ fontSize: 7, color: textSecond, margin: 0 }}>PROFIL SAYA</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: textPrimary, margin: 0 }}>Akaun</p>
            </div>
            {/* Profile card */}
            <div style={{ margin: "0 10px 10px", background: bgCard, border: `1px solid ${borderColor}`, borderRadius: 14, padding: "14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 16 }}>👤</span>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: textPrimary, margin: 0 }}>Ahmad Fauzi</p>
                <p style={{ fontSize: 8, color: textSecond, margin: 0 }}>01x-xxx-xxxx • ID #0001</p>
                <span style={{ fontSize: 6, fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.12)", borderRadius: 4, padding: "1px 5px" }}>Aktif</span>
              </div>
            </div>
            {/* Menu list */}
            <div style={{ padding: "0 10px", display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                ["👤","Maklumat Peribadi"],
                ["💳","Akaun Pengeluaran"],
                ["📜","Kontrak Pinjaman"],
                ["🔄","Sejarah Transaksi"],
                ["📨","Mesej"],
                ["🔒","Tukar Kata Laluan"],
              ].map(([icon, label]) => (
                <div key={label} style={{ background: bgCard, border: `1px solid ${borderColor}`, borderRadius: 10, padding: "9px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 7, background: bgCardInner, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 9 }}>{icon}</span>
                    </div>
                    <p style={{ fontSize: 9, fontWeight: 600, color: textPrimary, margin: 0 }}>{label}</p>
                  </div>
                  <p style={{ fontSize: 10, color: textSecond, margin: 0 }}>›</p>
                </div>
              ))}
            </div>
            {/* Logout */}
            <div style={{ padding: "10px 10px 60px" }}>
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px", textAlign: "center" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#ef4444", margin: 0 }}>Log Keluar</p>
              </div>
            </div>
          </div>
        );

      case "mohon":
        return (
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ padding: "14px 14px 10px" }}>
              <p style={{ fontSize: 7, color: accent, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>LANGKAH 1 / 4</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: textPrimary, margin: 0 }}>Mohon Pinjaman</p>
            </div>
            {/* Step indicator */}
            <div style={{ padding: "0 10px 10px", display: "flex", gap: 4 }}>
              {[1,2,3,4].map((n) => (
                <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n === 1 ? accent : bgCardInner }} />
              ))}
            </div>
            {/* Form card */}
            <div style={{ margin: "0 10px 8px", background: bgCard, border: `1px solid ${borderColor}`, borderRadius: 14, padding: "12px" }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: textSecond, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 0.5 }}>Maklumat Pinjaman</p>
              {[["Jumlah Pinjaman","RM 25,000"],["Tempoh","12 Bulan"],["Nama Bank","Maybank"],["No. Akaun","0198xxxx"]].map(([label, val]) => (
                <div key={label} style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 7, color: textMuted, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
                  <div style={{ background: bgCardInner, border: `1px solid ${borderLight}`, borderRadius: 8, padding: "7px 10px" }}>
                    <p style={{ fontSize: 9, color: textPrimary, margin: 0 }}>{val}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Summary */}
            <div style={{ margin: "0 10px 10px", background: `rgba(201,168,76,0.06)`, border: `1px solid rgba(201,168,76,0.2)`, borderRadius: 10, padding: "8px 10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p style={{ fontSize: 7, color: textSecond, margin: 0 }}>Bayaran Bulanan</p>
                <p style={{ fontSize: 9, fontWeight: 700, color: accent, margin: 0 }}>RM 2,258.33</p>
              </div>
            </div>
            {/* Next button */}
            <div style={{ padding: "0 10px 60px" }}>
              <div style={{ background: accent, borderRadius: 10, padding: "10px 0", textAlign: "center" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#000", margin: 0 }}>Seterusnya →</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#c9a84c", marginBottom: 12 }}>
        Preview Langsung — {p === "dark" ? "Dark Mode" : "Light Mode"}
      </p>

      {/* Page selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {pages.map((pg) => (
          <button
            key={pg.id}
            onClick={() => setPage(pg.id)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "7px 14px", borderRadius: 8, border: "1px solid",
              borderColor: page === pg.id ? "#c9a84c" : "var(--border-light)",
              background: page === pg.id ? "rgba(201,168,76,0.1)" : "var(--bg-card)",
              color: page === pg.id ? "#c9a84c" : "var(--text-secondary)",
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            <span>{pg.icon}</span> {pg.label}
          </button>
        ))}
      </div>

      {/* Phone frame */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{
          width: 260, borderRadius: 36, border: "6px solid #333",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8), inset 0 0 0 1px #555",
          overflow: "hidden", position: "relative", background: bgPrimary,
        }}>
          {/* Notch */}
          <div style={{ background: "#111", height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 60, height: 10, borderRadius: 10, background: "#222" }} />
          </div>

          {/* Screen */}
          <div style={{
            background: bgImage ? `url(${bgImage}) center/cover` : bgPrimary,
            minHeight: 480, position: "relative", fontFamily: "sans-serif",
            overflowY: "hidden",
          }}>
            {bgImage && <div style={{ position: "absolute", inset: 0, background: bgPrimary, opacity: 0.85 }} />}
            {renderPage()}
          </div>

          {/* Bottom nav */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: navBg, borderTop: `1px solid ${borderColor}`,
            display: "flex", justifyContent: "space-around", padding: "8px 0 10px",
          }}>
            {[["🏠","UTAMA"], ["💳","DOMPET"], ["🎧","SOKONGAN"], ["👤","SAYA"]].map(([icon, label], i) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: 13 }}>{icon}</span>
                <p style={{ fontSize: 6, fontWeight: 700, margin: 0, letterSpacing: 0.5, color: i === activeNavIdx ? accent : textMuted }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Color legend */}
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 6 }}>
        {[
          { label: "Latar Utama",      color: bgPrimary },
          { label: "Latar Sekunder",   color: bgSecondary },
          { label: "Latar Kad",        color: bgCard },
          { label: "Latar Dalam Kad",  color: bgCardInner },
          { label: "Warna Aksen",      color: accent },
          { label: "Teks Utama",       color: textPrimary },
          { label: "Teks Sekunder",    color: textSecond },
          { label: "Teks Pudar",       color: textMuted },
          { label: "Border Utama",     color: borderColor },
          { label: "Bottom Nav",       color: navBg },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-primary)", borderRadius: 8, padding: "7px 10px", border: "1px solid var(--border-color)" }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: color, border: "1px solid var(--border-light)", flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{label}</p>
              <p style={{ fontSize: 9, color: "var(--text-muted)", margin: 0, fontFamily: "monospace" }}>{color}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Field({ label, icon: Icon, children }: { label: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        {Icon && <Icon size={12} />} {label}
      </label>
      {children}
    </div>
  );
}

const card: React.CSSProperties = { background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24, marginBottom: 20 };
const sectionTitle: React.CSSProperties = { fontSize: 11, fontWeight: 700, marginBottom: 20, color: "#c9a84c", letterSpacing: 1, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 };
const iconInline: React.CSSProperties = { display: "inline", verticalAlign: "middle" };
