"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ChevronDown, User, Phone, Lock, CreditCard } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", ic: "", phone: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "• Nama penuh wajib diisi";
    if (!form.ic.trim()) e.ic = "• No. IC wajib diisi";
    else if (!/^\d{12}$/.test(form.ic.replace(/-/g, ""))) e.ic = "• Format IC tidak sah";
    if (!form.phone.trim()) e.phone = "• Nombor telefon wajib diisi";
    if (!form.password.trim()) e.password = "• Kata laluan wajib diisi";
    else if (form.password.length < 6) e.password = "• Minimum 6 aksara";
    if (!form.confirm.trim()) e.confirm = "• Sila sahkan kata laluan";
    else if (form.confirm !== form.password) e.confirm = "• Kata laluan tidak sepadan";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!agreed) { alert("Sila setuju dengan Terma & Syarat"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    router.push("/sign-in");
  };

  const fields = [
    { key: "name",     label: "Nama Penuh",       icon: User,       type: "text",     placeholder: "Contoh: Ahmad bin Ali" },
    { key: "ic",       label: "No. Kad Pengenalan", icon: CreditCard, type: "text",     placeholder: "000000000000" },
    { key: "phone",    label: "Nombor Telefon",    icon: Phone,      type: "tel",      placeholder: "0123456789" },
  ] as const;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      {/* Header */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px 0", gap: 14, animation: "fadeInUp 0.5s ease both" }}>
        <div style={{ width: 80, height: 80, background: "var(--bg-card)", borderRadius: 20, border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-card)", gap: 2 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 4 }}>
            <div style={{ width: 7, height: 14, background: "#3b82f6", borderRadius: 3 }} />
            <div style={{ width: 7, height: 22, background: "#60a5fa", borderRadius: 3 }} />
            <div style={{ width: 7, height: 18, background: "#93c5fd", borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 8, fontWeight: 800, color: "white", letterSpacing: 0.5 }}>MONEY LENDING</span>
          <span style={{ fontSize: 6, color: "var(--text-secondary)" }}>SDN BHD</span>
        </div>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Daftar Akaun</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Sila lengkapkan maklumat anda</p>
        </div>
      </div>

      {/* Form */}
      <div style={{ background: "var(--bg-secondary)", borderRadius: "28px 28px 0 0", padding: "28px 24px 40px", marginTop: 20, animation: "fadeInUp 0.5s ease 0.15s both" }}>

        {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label className="input-label">{label}</label>
            <div style={{ position: "relative" }}>
              <Icon size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                className="input-field"
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={set(key)}
                style={{ paddingLeft: 42 }}
              />
            </div>
            {errors[key] && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors[key]}</p>}
          </div>
        ))}

        {/* Password */}
        <div style={{ marginBottom: 16 }}>
          <label className="input-label">Kata Laluan</label>
          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              className="input-field"
              type={showPass ? "text" : "password"}
              placeholder="Min. 6 aksara"
              value={form.password}
              onChange={set("password")}
              style={{ paddingLeft: 42, paddingRight: 48 }}
            />
            <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: 20 }}>
          <label className="input-label">Sahkan Kata Laluan</label>
          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              className="input-field"
              type={showConfirm ? "text" : "password"}
              placeholder="Ulangi kata laluan"
              value={form.confirm}
              onChange={set("confirm")}
              style={{ paddingLeft: 42, paddingRight: 48 }}
            />
            <button onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirm && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{errors.confirm}</p>}
        </div>

        {/* Terms */}
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 22, cursor: "pointer" }}>
          <div
            onClick={() => setAgreed(!agreed)}
            style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${agreed ? "var(--accent-blue)" : "var(--border-light)"}`, background: agreed ? "var(--accent-blue)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.2s ease", cursor: "pointer" }}
          >
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
              Sedang mendaftar...
            </span>
          ) : "Daftar Sekarang"}
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
