"use client";
import { useState } from "react";
import { Eye, EyeOff, ChevronDown, User, Phone, Lock, CreditCard, CheckCircle } from "lucide-react";
import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";
import { useSettings } from "@/context/SettingsContext";
import { normalizePhone } from "@/lib/phone";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", ic: "", phone: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { company_name } = useSettings();

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
    setApiError("");
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "• Nama penuh wajib diisi";
    if (!form.ic.trim()) e.ic = "• No. IC wajib diisi";
    else if (!/^\d{5,}$/.test(form.ic.replace(/-/g, ""))) e.ic = "• IC mesti sekurang-kurangnya 5 digit angka";
    if (!form.phone.trim()) e.phone = "• Nombor telefon wajib diisi";
    else if (!/^\d{5,}$/.test(normalizePhone(form.phone))) e.phone = "• Nombor telefon tidak sah (min. 5 digit)";
    if (!form.password.trim()) e.password = "• Kata laluan wajib diisi";
    else if (form.password.length < 6) e.password = "• Minimum 6 aksara";
    if (!form.confirm.trim()) e.confirm = "• Sila sahkan kata laluan";
    else if (form.confirm !== form.password) e.confirm = "• Kata laluan tidak sepadan";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setApiError("");
    if (!validate()) return;
    if (!agreed) { setApiError("Sila setuju dengan Terma & Syarat terlebih dahulu."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          ic: form.ic.replace(/-/g, ""),
          phone: normalizePhone(form.phone),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.message || "Ralat. Sila cuba semula."); return; }
      setSubmitted(true);
    } catch {
      setApiError("Ralat sambungan. Sila cuba semula.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name",  label: "Nama Penuh",         icon: User,       type: "text", placeholder: "Contoh: Ahmad bin Ali" },
    { key: "ic",    label: "No. Kad Pengenalan",  icon: CreditCard, type: "text", placeholder: "Min. 5 digit angka" },
    { key: "phone", label: "Nombor Telefon",      icon: Phone,      type: "tel",  placeholder: "01x / +601x / 601x" },
  ] as const;

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", padding: "32px 24px", animation: "fadeInUp 0.5s ease both" }}>
        <div style={{ width: 80, height: 80, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <CheckCircle size={40} color="#22c55e" strokeWidth={1.5} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, textAlign: "center" }}>Permohonan Dihantar!</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, textAlign: "center", lineHeight: 1.7, maxWidth: 300, marginBottom: 32 }}>
          Permohonan anda sedang dalam semakan. Anda akan dihubungi setelah akaun diluluskan.
        </p>
        <div style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 14, padding: "16px 20px", width: "100%", maxWidth: 320, marginBottom: 28 }}>
          <p style={{ fontSize: 12, color: "var(--accent-gold)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Langkah Seterusnya</p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Hubungi Khidmat Pelanggan kami untuk mempercepatkan proses pengesahan akaun.
          </p>
        </div>
        <Link href="/sign-in" style={{ color: "var(--accent-blue-light)", fontWeight: 700, fontSize: 14 }}>
          Kembali ke Log Masuk
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px 0", gap: 14, animation: "fadeInUp 0.5s ease both" }}>
        <CompanyLogo size={80} fontSize={8} />
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Daftar Akaun</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Daftar ke {company_name}</p>
        </div>
      </div>

      <div style={{ background: "var(--bg-secondary)", borderRadius: "28px 28px 0 0", padding: "28px 24px 40px", marginTop: 20, animation: "fadeInUp 0.5s ease 0.15s both" }}>

        {apiError && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "12px 14px", marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: "#ef4444" }}>• {apiError}</span>
          </div>
        )}

        {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label className="input-label">{label}</label>
            <div style={{ position: "relative" }}>
              <Icon size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input className="input-field" type={type} placeholder={placeholder} value={form[key]} onChange={set(key)} style={{ paddingLeft: 42 }} />
            </div>
            {errors[key] && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors[key]}</p>}
          </div>
        ))}

        <div style={{ marginBottom: 16 }}>
          <label className="input-label">Kata Laluan</label>
          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input className="input-field" type={showPass ? "text" : "password"} placeholder="Min. 6 aksara" value={form.password} onChange={set("password")} style={{ paddingLeft: 42, paddingRight: 48 }} />
            <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.password}</p>}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="input-label">Sahkan Kata Laluan</label>
          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input className="input-field" type={showConfirm ? "text" : "password"} placeholder="Ulangi kata laluan" value={form.confirm} onChange={set("confirm")} style={{ paddingLeft: 42, paddingRight: 48 }} />
            <button onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirm && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.confirm}</p>}
        </div>

        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 22, cursor: "pointer" }}>
          <div onClick={() => setAgreed(!agreed)} style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${agreed ? "var(--accent-blue)" : "var(--border-light)"}`, background: agreed ? "var(--accent-blue)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.2s ease", cursor: "pointer" }}>
            {agreed && <span style={{ color: "white", fontSize: 12, fontWeight: 900, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Saya bersetuju dengan{" "}
            <span style={{ color: "var(--accent-blue-light)", fontWeight: 700 }}>Terma & Syarat</span>
            {" "}dan{" "}
            <span style={{ color: "var(--accent-blue-light)", fontWeight: 700 }}>Dasar Privasi</span>
          </span>
        </label>

        <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ opacity: loading ? 0.8 : 1 }}>
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
              Menghantar permohonan...
            </span>
          ) : "Hantar Permohonan"}
        </button>

        <p style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: "var(--text-secondary)" }}>
          Sudah ada akaun?{" "}
          <Link href="/sign-in" style={{ color: "var(--accent-blue-light)", fontWeight: 700 }}>Log Masuk</Link>
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 10, padding: "8px 16px", color: "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
            <span>🇲🇾</span><span>Melayu</span><ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
