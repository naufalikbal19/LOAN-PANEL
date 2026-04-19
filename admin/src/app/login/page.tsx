"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "• E-mel wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "• Format e-mel tidak sah";
    if (!password.trim()) e.password = "• Kata laluan wajib diisi";
    else if (password.length < 6) e.password = "• Kata laluan minimum 6 aksara";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "E-mel atau kata laluan tidak sah.");
        return;
      }

      if (data.role !== "admin" && data.role !== "staff") {
        setError("Akses ditolak. Akaun ini bukan akaun kakitangan.");
        return;
      }

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_role", data.role);
      localStorage.setItem("admin_name", data.name || "");

      router.push("/dashboard");
    } catch {
      setError("Ralat sambungan. Sila cuba semula.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-primary)",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -150,
          left: -150,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="animate-fade-in-up"
        style={{
          width: "100%",
          maxWidth: 460,
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: 24,
          padding: "40px 36px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
          position: "relative",
        }}
      >
        {/* Gold top border accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "10%",
            width: "80%",
            height: 2,
            background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
            borderRadius: "0 0 2px 2px",
          }}
        />

        {/* Logo & Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.25)",
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Shield size={32} color="#c9a84c" strokeWidth={1.5} />
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(201,168,76,0.08)",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: 20,
              padding: "4px 12px",
              marginBottom: 12,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#c9a84c" }}>
              Admin Portal
            </span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
            Pinjaman <span style={{ color: "#c9a84c" }}>Barakah</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
            Akses terhad untuk kakitangan sahaja
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="animate-fade-in"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 12,
              padding: "12px 14px",
              marginBottom: 20,
            }}
          >
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#ef4444" }}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 18 }}>
            <label className="input-label">E-mel</label>
            <input
              className="input-field"
              type="email"
              placeholder="admin@pinjamanbarakah.my"
              value={email}
              autoComplete="email"
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); setError(""); }}
            />
            {errors.email && (
              <p style={{ color: "var(--accent-red)", fontSize: 12, marginTop: 6 }}>{errors.email}</p>
            )}
          </div>

          <div style={{ marginBottom: 28 }}>
            <label className="input-label">Kata Laluan</label>
            <div style={{ position: "relative" }}>
              <input
                className="input-field"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                autoComplete="current-password"
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); setError(""); }}
                style={{ paddingRight: 48 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p style={{ color: "var(--accent-red)", fontSize: 12, marginTop: 6 }}>{errors.password}</p>
            )}
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(0,0,0,0.2)",
                    borderTopColor: "#000",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Mengesahkan...
              </span>
            ) : (
              "Log Masuk"
            )}
          </button>
        </form>

        {/* Footer note */}
        <p
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 12,
            color: "var(--text-muted)",
            lineHeight: 1.6,
          }}
        >
          Akses tidak sah adalah dilarang keras.<br />
          Semua aktiviti dilog dan dipantau.
        </p>
      </div>
    </div>
  );
}
