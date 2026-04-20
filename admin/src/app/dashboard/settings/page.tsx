"use client";
import { useEffect, useState } from "react";
import { Save, Image, Globe, Phone, MessageCircle, FileText } from "lucide-react";

interface Settings {
  company_name: string;
  company_tagline: string;
  logo_url: string;
  favicon_url: string;
  support_phone: string;
  support_whatsapp: string;
  keterangan_under_review: string;
  keterangan_loan_approved: string;
  keterangan_credit_frozen: string;
  keterangan_unfrozen_processing: string;
  keterangan_credit_score_low: string;
  keterangan_payment_processing: string;
  keterangan_loan_being_canceled: string;
}

const defaultSettings: Settings = {
  company_name: "",
  company_tagline: "",
  logo_url: "",
  favicon_url: "",
  support_phone: "",
  support_whatsapp: "",
  keterangan_under_review: "",
  keterangan_loan_approved: "",
  keterangan_credit_frozen: "",
  keterangan_unfrozen_processing: "",
  keterangan_credit_score_low: "",
  keterangan_payment_processing: "",
  keterangan_loan_being_canceled: "",
};

const KETERANGAN_FIELDS: { key: keyof Settings; label: string; badgeBg: string; badgeColor: string }[] = [
  { key: "keterangan_under_review",        label: "Under Review",        badgeBg: "rgba(201,168,76,0.15)",  badgeColor: "#c9a84c" },
  { key: "keterangan_loan_approved",       label: "Loan Approved",       badgeBg: "rgba(34,197,94,0.12)",  badgeColor: "#22c55e" },
  { key: "keterangan_credit_frozen",       label: "Credit Frozen",       badgeBg: "rgba(239,68,68,0.12)",  badgeColor: "#ef4444" },
  { key: "keterangan_unfrozen_processing", label: "Unfrozen Processing", badgeBg: "rgba(251,146,60,0.12)", badgeColor: "#fb923c" },
  { key: "keterangan_credit_score_low",    label: "Credit Score Low",    badgeBg: "rgba(239,68,68,0.08)",  badgeColor: "#f87171" },
  { key: "keterangan_payment_processing",  label: "Payment Processing",  badgeBg: "rgba(99,102,241,0.12)", badgeColor: "#818cf8" },
  { key: "keterangan_loan_being_canceled", label: "Loan Being Canceled", badgeBg: "rgba(107,114,128,0.12)",badgeColor: "#9ca3af" },
];

type SaveStatus = "idle" | "saving" | "success" | "error";

function SettingsField({ label, value, onChange, placeholder, icon: Icon, focused, onFocus, onBlur }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; icon: React.ElementType; focused: boolean; onFocus: () => void; onBlur: () => void;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#888", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <Icon size={12} /> {label}
      </label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{ background: "#1e1e1e", border: `1px solid ${focused ? "#c9a84c" : "#2e2e2e"}`, borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, width: "100%", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
      />
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [focusedField, setFocusedField] = useState<keyof Settings | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`)
      .then((r) => r.json())
      .then((data) => { setSettings({ ...defaultSettings, ...data }); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings((p) => ({ ...p, [key]: e.target.value }));
    if (status !== "idle") setStatus("idle");
  };

  const handleSave = async () => {
    setStatus("saving"); setErrorMsg("");
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus("error"); setErrorMsg(data.message || "Gagal menyimpan."); return; }
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setErrorMsg("Ralat sambungan. Sila cuba semula.");
    }
  };

  const fp = (key: keyof Settings, label: string, placeholder: string, icon: React.ElementType) => ({
    label, value: settings[key], onChange: set(key) as any, placeholder, icon,
    focused: focusedField === key, onFocus: () => setFocusedField(key), onBlur: () => setFocusedField(null),
  });

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, color: "#888" }}>Memuatkan tetapan...</div>
  );

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: "#888", fontSize: 13 }}>Konfigurasi maklumat dan rupa syarikat</p>
      </div>

      {/* Company */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "24px", marginBottom: 20 }}>
        <h2 style={sectionTitle}>Maklumat Syarikat</h2>
        <SettingsField {...fp("company_name", "Nama Syarikat", "Pinjaman Barakah", Globe)} />
        <SettingsField {...fp("company_tagline", "Tagline", "Pinjaman peribadi terbaik untuk anda", Globe)} />
      </div>

      {/* Logo */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "24px", marginBottom: 20 }}>
        <h2 style={sectionTitle}>Logo & Favicon</h2>
        <SettingsField {...fp("logo_url", "URL Logo", "https://cdn.example.com/logo.png", Image)} />
        {settings.logo_url && (
          <div style={{ marginBottom: 20, padding: 12, background: "#1a1a1a", borderRadius: 10, display: "inline-block" }}>
            <img src={settings.logo_url} alt="Preview logo" style={{ height: 48, objectFit: "contain" }} onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
          </div>
        )}
        <SettingsField {...fp("favicon_url", "URL Favicon", "https://cdn.example.com/favicon.ico", Image)} />
      </div>

      {/* Support */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "24px", marginBottom: 20 }}>
        <h2 style={sectionTitle}>Maklumat Sokongan</h2>
        <SettingsField {...fp("support_phone", "Nombor Telefon", "+60123456789", Phone)} />
        <SettingsField {...fp("support_whatsapp", "WhatsApp", "60123456789", MessageCircle)} />
      </div>

      {/* Keterangan Templates */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "24px", marginBottom: 28 }}>
        <h2 style={sectionTitle}>Template Keterangan Pinjaman</h2>
        <p style={{ fontSize: 12, color: "#666", marginBottom: 20 }}>
          Teks ini akan auto-diisi dalam medan Keterangan apabila status pinjaman ditukar. Staff boleh edit secara manual.
        </p>
        {KETERANGAN_FIELDS.map(({ key, label, badgeBg, badgeColor }) => (
          <div key={key} style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#666", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={11} />
              <span style={{ background: badgeBg, color: badgeColor, padding: "2px 8px", borderRadius: 8, fontSize: 10, fontWeight: 700 }}>{label}</span>
            </label>
            <textarea
              value={settings[key]}
              onChange={set(key)}
              onFocus={() => setFocusedField(key)}
              onBlur={() => setFocusedField(null)}
              rows={3}
              style={{
                background: "#1e1e1e",
                border: `1px solid ${focusedField === key ? "#c9a84c" : "#2e2e2e"}`,
                borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 13,
                width: "100%", outline: "none", fontFamily: "inherit",
                resize: "vertical", lineHeight: 1.6, transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}
      </div>

      {status === "error" && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#ef4444", fontSize: 13 }}>
          {errorMsg}
        </div>
      )}
      {status === "success" && (
        <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#22c55e", fontSize: 13 }}>
          ✓ Tetapan berjaya disimpan.
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={status === "saving"}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "#c9a84c", color: "#000", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: status === "saving" ? "not-allowed" : "pointer", opacity: status === "saving" ? 0.7 : 1, fontFamily: "inherit" }}
      >
        <Save size={16} /> {status === "saving" ? "Menyimpan..." : "Simpan Tetapan"}
      </button>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, marginBottom: 20, color: "#c9a84c", letterSpacing: 1, textTransform: "uppercase",
};
