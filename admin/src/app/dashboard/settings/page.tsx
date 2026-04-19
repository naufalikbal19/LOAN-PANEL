"use client";
import { useEffect, useState } from "react";
import { Save, Image, Globe, Phone, MessageCircle } from "lucide-react";

interface Settings {
  company_name: string;
  company_tagline: string;
  logo_url: string;
  favicon_url: string;
  support_phone: string;
  support_whatsapp: string;
}

const defaultSettings: Settings = {
  company_name: "",
  company_tagline: "",
  logo_url: "",
  favicon_url: "",
  support_phone: "",
  support_whatsapp: "",
};

type SaveStatus = "idle" | "saving" | "success" | "error";

interface FieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: React.ElementType;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

function SettingsField({ label, value, onChange, placeholder, icon: Icon, focused, onFocus, onBlur }: FieldProps) {
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

  const set = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const fieldProps = (key: keyof Settings, label: string, placeholder: string, icon: React.ElementType) => ({
    label,
    value: settings[key],
    onChange: set(key),
    placeholder,
    icon,
    focused: focusedField === key,
    onFocus: () => setFocusedField(key),
    onBlur: () => setFocusedField(null),
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

      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "24px", marginBottom: 20 }}>
        <h2 style={{ fontSize: 11, fontWeight: 700, marginBottom: 20, color: "#c9a84c", letterSpacing: 1, textTransform: "uppercase" }}>Maklumat Syarikat</h2>
        <SettingsField {...fieldProps("company_name", "Nama Syarikat", "Pinjaman Barakah", Globe)} />
        <SettingsField {...fieldProps("company_tagline", "Tagline", "Pinjaman peribadi terbaik untuk anda", Globe)} />
      </div>

      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "24px", marginBottom: 20 }}>
        <h2 style={{ fontSize: 11, fontWeight: 700, marginBottom: 20, color: "#c9a84c", letterSpacing: 1, textTransform: "uppercase" }}>Logo & Favicon</h2>
        <SettingsField {...fieldProps("logo_url", "URL Logo", "https://cdn.example.com/logo.png", Image)} />
        {settings.logo_url && (
          <div style={{ marginBottom: 20, padding: 12, background: "#1a1a1a", borderRadius: 10, display: "inline-block" }}>
            <img src={settings.logo_url} alt="Preview logo" style={{ height: 48, objectFit: "contain" }} onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
          </div>
        )}
        <SettingsField {...fieldProps("favicon_url", "URL Favicon", "https://cdn.example.com/favicon.ico", Image)} />
      </div>

      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "24px", marginBottom: 28 }}>
        <h2 style={{ fontSize: 11, fontWeight: 700, marginBottom: 20, color: "#c9a84c", letterSpacing: 1, textTransform: "uppercase" }}>Maklumat Sokongan</h2>
        <SettingsField {...fieldProps("support_phone", "Nombor Telefon", "+60123456789", Phone)} />
        <SettingsField {...fieldProps("support_whatsapp", "WhatsApp", "60123456789", MessageCircle)} />
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
