"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validate = () => {
    const e: typeof errors = {};
    if (!phone.trim()) e.phone = "• Nombor telefon wajib diisi";
    if (!password.trim()) e.password = "• Password wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px 0", gap: 16, animation: "fadeInUp 0.5s ease both" }}>
        <div style={{ width: 90, height: 90, background: "var(--bg-card)", borderRadius: 22, border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-card)", gap: 2 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 4 }}>
            <div style={{ width: 8, height: 16, background: "#3b82f6", borderRadius: 3 }} />
            <div style={{ width: 8, height: 24, background: "#60a5fa", borderRadius: 3 }} />
            <div style={{ width: 8, height: 20, background: "#93c5fd", borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 9, fontWeight: 800, color: "white", letterSpacing: 0.5 }}>MONEY LENDING</span>
          <span style={{ fontSize: 7, color: "var(--text-secondary)" }}>SDN BHD</span>
        </div>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Selamat Datang</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Sila log masuk ke akaun anda</p>
        </div>
      </div>
      <div style={{ background: "var(--bg-secondary)", borderRadius: "28px 28px 0 0", padding: "32px 24px 40px", marginTop: 24, animation: "fadeInUp 0.5s ease 0.15s both" }}>
        <div style={{ marginBottom: 18 }}>
          <label className="input-label">Nombor Telefon</label>
          <input className="input-field" type="tel" placeholder="0123456789" value={phone} onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })); }} />
          {errors.phone && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>{errors.phone}</p>}
        </div>
        <div style={{ marginBottom: 24 }}>
          <label className="input-label">Kata Laluan</label>
          <div style={{ position: "relative" }}>
            <input className="input-field" type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }} style={{ paddingRight: 48 }} />
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
              Sedang log masuk...
            </span>
          ) : "Log Masuk"}
        </button>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text-secondary)" }}>
          Tiada Akaun?{" "}
          <Link href="/register" style={{ color: "var(--accent-blue-light)", fontWeight: 700 }}>Daftar Sekarang</Link>
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 10, padding: "8px 16px", color: "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
            <span>🇲🇾</span><span>Melayu</span><ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
