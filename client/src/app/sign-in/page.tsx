"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";
import { useSettings } from "@/context/SettingsContext";
import { normalizePhone, validatePhone } from "@/lib/phone";
import { useLanguage } from "@/context/LanguageContext";
import type { Lang } from "@/lib/translations";

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: "ms", flag: "🇲🇾", label: "Melayu" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "zh", flag: "🇨🇳", label: "中文" },
];

export default function SignInPage() {
  const { company_name } = useSettings();
  const { lang, setLang, t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validate = () => {
    const e: typeof errors = {};
    if (!phone.trim()) {
      e.phone = t("err_phone_required");
    } else if (!/^(01|60)/.test(phone)) {
      e.phone = "Nombor telefon mesti bermula dengan 01 atau 60.";
    } else {
      const phoneErr = validatePhone(phone);
      if (phoneErr) e.phone = t("err_phone_required");
    }
    if (!password.trim()) e.password = t("err_password_required");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizePhone(phone), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.message || "Nombor telefon atau kata laluan tidak sah.");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_name", data.name || "");
      localStorage.setItem("user_phone", normalizePhone(phone));
      router.push("/dashboard");
    } catch {
      setApiError("Ralat sambungan. Sila cuba semula.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px 0", gap: 16, animation: "fadeInUp 0.5s ease both" }}>
        <CompanyLogo size={90} fontSize={9} />
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>{t("welcome")}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{t("login_to")} {company_name}</p>
        </div>
      </div>

      <div style={{ background: "var(--bg-secondary)", borderRadius: "28px 28px 0 0", padding: "32px 24px 40px", marginTop: 24, animation: "fadeInUp 0.5s ease 0.15s both" }}>
        {apiError && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "12px 14px", marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: "#ef4444" }}>• {apiError}</span>
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <label className="input-label">{t("phone")}</label>
          <input
            className="input-field"
            type="tel"
            placeholder="0123456789"
            value={phone}
            onChange={(e) => {
              const raw = e.target.value.replace(/[\s+]/g, "");
              setPhone(raw);
              setErrors((p) => ({ ...p, phone: undefined }));
              setApiError("");
            }}
          />
          {errors.phone && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>{errors.phone}</p>}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label className="input-label">{t("password")}</label>
          <div style={{ position: "relative" }}>
            <input
              className="input-field"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); setApiError(""); }}
              style={{ paddingRight: 48 }}
            />
            <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>{errors.password}</p>}
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ opacity: loading ? 0.8 : 1 }}>
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
              {t("logging_in")}
            </span>
          ) : t("login_btn")}
        </button>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text-secondary)" }}>
          {t("no_account")}{" "}
          <Link href="/register" style={{ color: "var(--accent-blue-light)", fontWeight: 700 }}>{t("register_now")}</Link>
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 24, position: "relative" }}>
          <button
            onClick={() => setShowLangPicker((p) => !p)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 10, padding: "8px 16px", color: "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}
          >
            <span>{LANGS.find((l) => l.code === lang)?.flag}</span>
            <span>{LANGS.find((l) => l.code === lang)?.label}</span>
            <span style={{ fontSize: 10 }}>▼</span>
          </button>
          {showLangPicker && (
            <div style={{ position: "absolute", bottom: "calc(100% + 8px)", background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 12, overflow: "hidden", zIndex: 10, minWidth: 140, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
              {LANGS.map((l) => (
                <button key={l.code} onClick={() => { setLang(l.code); setShowLangPicker(false); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", background: lang === l.code ? "rgba(201,168,76,0.1)" : "transparent", border: "none", cursor: "pointer", color: lang === l.code ? "#c9a84c" : "var(--text-primary)", fontSize: 13, fontFamily: "inherit", fontWeight: lang === l.code ? 700 : 400 }}>
                  <span>{l.flag}</span><span>{l.label}</span>
                  {lang === l.code && <span style={{ marginLeft: "auto", fontSize: 11, color: "#c9a84c" }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
