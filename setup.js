const fs = require('fs');
const path = require('path');

function w(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓', filePath);
}

// ─── 1. globals.css ───────────────────────────────────────────────────────────
w('src/app/globals.css', `@import 'tailwindcss';
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

:root {
  --bg-primary: #0b0f2a;
  --bg-secondary: #111535;
  --bg-card: #161b3d;
  --bg-card-inner: #1c2348;
  --accent-blue: #3b6dff;
  --accent-blue-light: #4a7bff;
  --accent-blue-hover: #2d5eee;
  --accent-green: #22c55e;
  --accent-gold: #f59e0b;
  --text-primary: #ffffff;
  --text-secondary: #8b9cc8;
  --text-muted: #4e5f8a;
  --border-color: #1e2a50;
  --border-light: #253060;
  --nav-bg: #0f1535;
  --shadow-button: 0 4px 20px rgba(59,109,255,0.4);
  --shadow-card: 0 8px 32px rgba(0,0,0,0.4);
  --radius-card: 20px;
  --radius-btn: 14px;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg-primary); color: var(--text-primary); -webkit-font-smoothing: antialiased; }
body { min-height: 100vh; background: var(--bg-primary); overflow-x: hidden; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg-primary); }
::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 2px; }
.app-shell { max-width: 430px; margin: 0 auto; min-height: 100vh; position: relative; background: var(--bg-primary); overflow: hidden; }
.page-content { position: relative; z-index: 1; padding-bottom: 90px; }
.card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-card); padding: 20px; }
.btn-primary { background: var(--accent-blue); color: white; border: none; border-radius: var(--radius-btn); padding: 16px 24px; font-weight: 600; font-size: 15px; cursor: pointer; width: 100%; transition: all 0.2s ease; box-shadow: var(--shadow-button); font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: 0.3px; }
.btn-primary:hover { background: var(--accent-blue-hover); transform: translateY(-1px); box-shadow: 0 6px 24px rgba(59,109,255,0.5); }
.btn-outline { background: transparent; color: var(--accent-blue); border: 1.5px solid var(--accent-blue); border-radius: var(--radius-btn); padding: 14px 24px; font-weight: 600; font-size: 15px; cursor: pointer; width: 100%; transition: all 0.2s ease; font-family: 'Plus Jakarta Sans', sans-serif; }
.input-field { background: var(--bg-card-inner); border: 1px solid var(--border-light); border-radius: 12px; padding: 14px 16px; color: var(--text-primary); font-size: 15px; width: 100%; outline: none; transition: border-color 0.2s ease; font-family: 'Plus Jakarta Sans', sans-serif; }
.input-field:focus { border-color: var(--accent-blue); box-shadow: 0 0 0 3px rgba(59,109,255,0.15); }
.input-field::placeholder { color: var(--text-muted); }
.input-label { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px; display: block; }
.bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; background: var(--nav-bg); border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-around; padding: 10px 0 20px; z-index: 100; backdrop-filter: blur(20px); }
.nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; padding: 6px 16px; border-radius: 12px; transition: all 0.2s ease; text-decoration: none; color: var(--text-muted); }
.nav-item.active { color: #3b6dff; }
.nav-item span { font-size: 9px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; white-space: nowrap; }
.badge-verified { background: rgba(34,197,94,0.15); color: var(--accent-green); border: 1px solid rgba(34,197,94,0.3); border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px; }
.badge-excellent { background: rgba(59,109,255,0.15); color: var(--accent-blue-light); border: 1px solid rgba(59,109,255,0.3); border-radius: 6px; padding: 3px 10px; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
.badge-available { background: rgba(34,197,94,0.1); color: var(--accent-green); border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; }
.page-header { padding: 20px 20px 0; }
.page-title { font-size: 22px; font-weight: 800; color: var(--text-primary); line-height: 1.2; }
.page-title span { color: #4a7bff; }
.page-subtitle { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--accent-blue); margin-bottom: 4px; }
.section-label { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--text-secondary); text-align: center; margin: 16px 0; }
.menu-item { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; cursor: pointer; transition: all 0.2s ease; text-decoration: none; color: var(--text-primary); }
.menu-item:hover { background: var(--bg-card-inner); border-color: var(--border-light); transform: translateX(3px); }
.menu-item-left { display: flex; align-items: center; gap: 14px; }
.menu-icon-box { width: 40px; height: 40px; border-radius: 12px; background: var(--bg-card-inner); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.apply-btn { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; border: none; border-radius: 14px; padding: 14px 28px; font-weight: 700; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease; box-shadow: 0 4px 20px rgba(245,158,11,0.4); white-space: nowrap; font-family: 'Plus Jakarta Sans', sans-serif; }
.apply-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(245,158,11,0.5); }
.payment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.payment-item { background: var(--bg-card-inner); border: 1px solid var(--border-light); border-radius: 12px; padding: 14px 10px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s ease; }
.payment-item:hover { border-color: var(--accent-blue); background: rgba(59,109,255,0.08); }
.payment-logo { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.info-banner { background: rgba(59,109,255,0.08); border: 1px solid rgba(59,109,255,0.2); border-radius: 12px; padding: 14px 16px; display: flex; gap: 10px; align-items: flex-start; margin: 0 20px; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.85); } }
@keyframes spin { to { transform: rotate(360deg); } }
.animate-fade-in-up { animation: fadeInUp 0.5s ease both; }
.animate-delay-1 { animation-delay: 0.1s; }
.animate-delay-2 { animation-delay: 0.2s; }
.animate-delay-3 { animation-delay: 0.3s; }
.animate-delay-4 { animation-delay: 0.4s; }
.animate-delay-5 { animation-delay: 0.5s; }
`);

// ─── 2. Root layout ───────────────────────────────────────────────────────────
w('src/app/layout.tsx', `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Money Lending Sdn Bhd",
  description: "Pinjaman peribadi terbaik untuk anda",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
`);

// ─── 3. Root page (redirect) ──────────────────────────────────────────────────
w('src/app/page.tsx', `import { redirect } from "next/navigation";
export default function RootPage() { redirect("/sign-in"); }
`);

// ─── 4. BottomNav component ───────────────────────────────────────────────────
w('src/components/BottomNav.tsx', `"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Headphones, User } from "lucide-react";

const navItems = [
  { href: "/dashboard",          icon: Home,       label: "Laman Utama" },
  { href: "/dashboard/wallet",   icon: Wallet,     label: "Dompet" },
  { href: "/dashboard/support",  icon: Headphones, label: "Sokongan" },
  { href: "/dashboard/account",  icon: User,       label: "Saya" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link key={href} href={href} className={\`nav-item \${isActive ? "active" : ""}\`}>
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
`);

// ─── 5. Dashboard layout ──────────────────────────────────────────────────────
w('src/app/dashboard/layout.tsx', `import BottomNav from "@/components/BottomNav";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="page-content">{children}</div>
      <BottomNav />
    </>
  );
}
`);

// ─── 6. Sign-in page ──────────────────────────────────────────────────────────
w('src/app/sign-in/page.tsx', `"use client";
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
`);

// ─── 7. Dashboard home ────────────────────────────────────────────────────────
w('src/app/dashboard/page.tsx', `"use client";
import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";

const trustBadges = [
  { label: "PIDM", color: "#1a56db", text: "P" },
  { label: "KDN",  emoji: "🇲🇾" },
  { label: "CWSP", color: "#7c3aed", text: "C" },
  { label: "BNM",  color: "#0891b2", text: "B" },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="page-header animate-fade-in-up" style={{ paddingTop: 24, paddingBottom: 20 }}>
        <p className="page-subtitle">Premium Membership</p>
        <h1 className="page-title">Pinjaman peribadi terbaik <span>untuk anda</span></h1>
      </div>

      {/* Greeting Card */}
      <div style={{ padding: "0 20px 20px" }} className="animate-fade-in-up animate-delay-1">
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-green)", animation: "pulse-dot 2s ease infinite", flexShrink: 0 }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>Hai, 01169624998 👋</span>
          </div>
          <div style={{ padding: "14px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--accent-gold)", background: "rgba(245,158,11,0.12)", borderRadius: 6, padding: "3px 8px", display: "inline-block", marginBottom: 8 }}>Sedang Memohon</span>
                <div style={{ display: "flex", gap: 16 }}>
                  <div><p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 2 }}>Jumlah</p><p style={{ fontSize: 17, fontWeight: 800 }}>RM10,000</p></div>
                  <div><p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 2 }}>Rujukan</p><p style={{ fontSize: 14, fontWeight: 600 }}>01****1312</p></div>
                  <div><p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 2 }}>Bayar Menjelang</p><p style={{ fontSize: 14, fontWeight: 600 }}>30/06/2025</p></div>
                </div>
              </div>
              <Link href="/dashboard/wallet">
                <button className="apply-btn" style={{ fontSize: 12, padding: "10px 14px" }}>Wallet <ArrowRight size={14} /></button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Now Banner */}
      <div style={{ padding: "0 20px 20px" }} className="animate-fade-in-up animate-delay-2">
        <div className="card" style={{ background: "linear-gradient(135deg,#1a2560 0%,#0f1535 100%)", border: "1px solid var(--border-light)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(59,109,255,0.08)", border: "1px solid rgba(59,109,255,0.1)" }} />
          <div style={{ position: "relative" }}>
            <span className="badge-available" style={{ marginBottom: 12, display: "inline-flex" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)", display: "inline-block" }} />
              LIMIT TERSEDIA
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Hello, 👋</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8 }}>Loan limit up to (RM)</p>
            <p style={{ fontSize: 26, fontWeight: 900, marginBottom: 16 }}>RM 5,000 - 200,000</p>
            <button className="apply-btn">Apply Now <ArrowRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Pinjaman Banner */}
      <div style={{ padding: "0 20px 20px" }} className="animate-fade-in-up animate-delay-3">
        <div className="card" style={{ background: "linear-gradient(135deg,#1c2a5e 0%,#0e1535 100%)", border: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 16, overflow: "hidden" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, background: "rgba(59,109,255,0.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏢</div>
              <div><p style={{ fontSize: 9, color: "var(--text-secondary)" }}>MONEY LENDING</p><p style={{ fontSize: 9, color: "var(--text-secondary)" }}>SDN BHD</p></div>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Pinjaman <span style={{ color: "var(--accent-blue-light)" }}>Kakitangan</span><br />Kerajaan</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>Pinjaman peribadi dengan tempoh bayaran fleksibel sehingga 72 bulan.</p>
            <button className="btn-outline" style={{ width: "auto", padding: "10px 20px", fontSize: 13 }}>Mohon Sekarang</button>
          </div>
          <div style={{ width: 80, height: 100, background: "rgba(59,109,255,0.08)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, flexShrink: 0 }}>👨‍💼</div>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "0 20px 20px" }} className="animate-fade-in-up animate-delay-4">
        <p className="section-label">Informasi Perkhidmatan</p>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, background: "rgba(245,158,11,0.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🤝</div>
          <div style={{ flex: 1 }}><p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>Professional and friendly customer support team</p></div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>
      </div>

      {/* Trust Badges */}
      <div className="animate-fade-in-up animate-delay-5">
        <p className="section-label">Diiktiraf Oleh</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", padding: "0 20px 16px" }}>
          {trustBadges.map((b) => (
            <div key={b.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 14, padding: 12, width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {b.emoji ? <span style={{ fontSize: 28 }}>{b.emoji}</span> : <div style={{ width: 42, height: 42, borderRadius: 10, background: b.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 16, fontWeight: 900 }}>{b.text}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`);

// ─── 8. Wallet page ───────────────────────────────────────────────────────────
w('src/app/dashboard/wallet/page.tsx', `"use client";
import { Eye, EyeOff, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const payments = [
  { id: "boost",   label: "Boost",   emoji: "⚡", bg: "#fef2f2" },
  { id: "gxbank",  label: "GXBank",  emoji: "🏦", bg: "#eff6ff" },
  { id: "ewallet", label: "eWallet", emoji: "💳", bg: "#f5f3ff" },
  { id: "maybank", label: "Maybank", emoji: "🏧", bg: "#fffbeb" },
  { id: "cimb",    label: "CIMB",    emoji: "🔴", bg: "#fef2f2" },
  { id: "rhb",     label: "RHB",     emoji: "🟢", bg: "#ecfdf5" },
];

const txs = [
  { id: 1, type: "Bayaran Masuk", amount: "+RM 6,600", date: "15 Apr 2025", color: "#22c55e" },
  { id: 2, type: "Pengeluaran",   amount: "-RM 500",   date: "10 Apr 2025", color: "#ef4444" },
  { id: 3, type: "Bayaran Masuk", amount: "+RM 2,000", date: "01 Apr 2025", color: "#22c55e" },
];

export default function WalletPage() {
  const [show, setShow] = useState(true);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", animation: "fadeInUp 0.4s ease both" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Dompet Saya</h1>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--accent-blue)" }}>Financial Overview</p>
        </div>
        <span className="badge-verified"><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)", display: "inline-block" }} />TERVERIFIKASI</span>
      </div>

      {/* Wallet Card */}
      <div style={{ padding: "0 20px 20px", animation: "fadeInUp 0.4s ease 0.1s both" }}>
        <div className="card" style={{ background: "linear-gradient(135deg,#1e2d6b 0%,#0f1535 100%)", border: "1px solid var(--border-light)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", right: -20, top: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(59,109,255,0.1)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Link href="/dashboard">
                  <button style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
                    <ChevronLeft size={16} />
                  </button>
                </Link>
                <div><p style={{ fontSize: 13, fontWeight: 700 }}>WALLET</p><p style={{ fontSize: 10, color: "var(--text-secondary)", letterSpacing: 1 }}>SECURE PAGE</p></div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-green)", boxShadow: "0 0 8px rgba(34,197,94,0.6)" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: 0.5 }}>AKAUN SAYA</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <p style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>{show ? "RM 6,600" : "RM ••••"}</p>
                <button onClick={() => setShow(!show)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>Akaun no: 01****1312</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 16px" }}>
              <div><p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 2 }}>Loan Details</p><p style={{ fontSize: 15, fontWeight: 700 }}>RM 10,000</p></div>
              <button style={{ background: "var(--accent-blue)", border: "none", borderRadius: 8, padding: "6px 14px", color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>WALLET</button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div style={{ padding: "0 20px 20px", animation: "fadeInUp 0.4s ease 0.2s both" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 14 }}>Kaedah Pembayaran</p>
        <div className="payment-grid">
          {payments.map((m) => (
            <div key={m.id} className="payment-item">
              <div className="payment-logo" style={{ background: m.bg }}>{m.emoji}</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div style={{ padding: "0 20px 20px", animation: "fadeInUp 0.4s ease 0.3s both" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Sejarah Transaksi</p>
          <button style={{ background: "none", border: "none", color: "var(--accent-blue-light)", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 2, fontFamily: "inherit" }}>Lihat Semua <ChevronRight size={14} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {txs.map((t) => (
            <div key={t.id} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: \`\${t.color}18\`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{t.amount.startsWith("+") ? "📥" : "📤"}</div>
                <div><p style={{ fontSize: 14, fontWeight: 600 }}>{t.type}</p><p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t.date}</p></div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: t.color }}>{t.amount}</p>
                <p style={{ fontSize: 11, color: "var(--accent-green)" }}>berjaya</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="info-banner" style={{ marginBottom: 16, animation: "fadeInUp 0.4s ease 0.4s both" }}>
        <Info size={16} color="var(--accent-blue-light)" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>Pastikan semua data transaksi anda selaras dengan profil yang didaftarkan untuk proses pengeluaran yang lebih lancar.</p>
      </div>
    </div>
  );
}
`);

// ─── 9. Account page ──────────────────────────────────────────────────────────
w('src/app/dashboard/account/page.tsx', `"use client";
import { ChevronLeft, ChevronRight, User, Lock, Banknote, FileText, CalendarClock, History, MessageSquare, LogOut } from "lucide-react";
import Link from "next/link";

const menu = [
  { icon: User,          label: "Personal Information", href: "#", color: "#3b6dff" },
  { icon: Lock,          label: "Change Password",      href: "#", color: "#7c3aed" },
  { icon: Banknote,      label: "Withdrawal Account",   href: "#", color: "#059669" },
  { icon: FileText,      label: "Loan Contract",        href: "#", color: "#f59e0b" },
  { icon: CalendarClock, label: "Repayment",            href: "#", color: "#0891b2" },
  { icon: History,       label: "Transaction History",  href: "#", color: "#6366f1" },
  { icon: MessageSquare, label: "Messages",             href: "#", color: "#ec4899" },
];

function Gauge({ score }: { score: number }) {
  const pct = score / 850;
  const r = 36, circ = Math.PI * r, dash = pct * circ;
  const color = pct > 0.7 ? "#22c55e" : pct > 0.4 ? "#f59e0b" : "#ef4444";
  return (
    <svg width="90" height="54" viewBox="0 0 90 54">
      <path d="M 9 45 A 36 36 0 0 1 81 45" fill="none" stroke="#1e2a50" strokeWidth="8" strokeLinecap="round" />
      <path d="M 9 45 A 36 36 0 0 1 81 45" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={\`\${dash} \${circ}\`} />
      <circle cx="45" cy="45" r="4" fill={color} />
    </svg>
  );
}

export default function AccountPage() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 16px", animation: "fadeInUp 0.4s ease both" }}>
        <Link href="/dashboard">
          <button style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }}>
            <ChevronLeft size={18} />
          </button>
        </Link>
        <div><p style={{ fontSize: 18, fontWeight: 800 }}>MY ACCOUNT</p><p style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--text-secondary)", textTransform: "uppercase" }}>Secure Page</p></div>
        <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "var(--accent-blue)", boxShadow: "0 0 8px rgba(59,109,255,0.6)" }} />
      </div>

      <div style={{ padding: "0 20px 20px", animation: "fadeInUp 0.4s ease 0.1s both" }}>
        <div className="card" style={{ background: "linear-gradient(135deg,#1e2d6b 0%,#0f1535 100%)", border: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 8 }}>Credit Score</p>
            <p style={{ fontSize: 44, fontWeight: 900, lineHeight: 1, marginBottom: 10 }}>500</p>
            <span className="badge-excellent">EXCELLENT</span>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>Terakhir dikemaskini hari ini</p>
          </div>
          <div style={{ width: 72, height: 72, background: "var(--bg-card-inner)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-light)" }}>
            <Gauge score={500} />
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px 12px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-secondary)" }}>Pengurusan Akaun</p>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10, animation: "fadeInUp 0.4s ease 0.2s both" }}>
        {menu.map(({ icon: Icon, label, href, color }) => (
          <Link key={label} href={href} className="menu-item">
            <div className="menu-item-left">
              <div className="menu-icon-box" style={{ background: \`\${color}18\` }}><Icon size={18} color={color} strokeWidth={2} /></div>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </Link>
        ))}
      </div>

      <div style={{ padding: "20px 20px 8px", animation: "fadeInUp 0.4s ease 0.3s both" }}>
        <button style={{ width: "100%", background: "transparent", border: "1.5px solid rgba(239,68,68,0.4)", borderRadius: 14, padding: 16, color: "#ef4444", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "inherit", letterSpacing: 1 }}>
          <LogOut size={16} /> LOG KELUAR AKAUN
        </button>
      </div>
    </div>
  );
}
`);

// ─── 10. Support page ─────────────────────────────────────────────────────────
w('src/app/dashboard/support/page.tsx', `"use client";
import { Phone, MessageCircle, Mail, Clock, ChevronRight } from "lucide-react";

const contacts = [
  { icon: Phone,         label: "Telefon",  value: "+60 11-1234 5678",      color: "#22c55e", action: "Hubungi" },
  { icon: MessageCircle, label: "WhatsApp", value: "+60 11-1234 5678",      color: "#22c55e", action: "WhatsApp" },
  { icon: Mail,          label: "E-mel",    value: "support@moneylending.com", color: "#3b6dff", action: "E-mel" },
];

const faq = [
  { q: "Bagaimana untuk memohon pinjaman?",     a: "Klik butang Apply Now di laman utama dan ikuti langkah yang diberikan." },
  { q: "Berapa lama proses kelulusan?",          a: "Proses kelulusan mengambil masa 1-3 hari bekerja." },
  { q: "Apakah dokumen yang diperlukan?",        a: "IC, slip gaji 3 bulan terkini, dan penyata bank 3 bulan terkini." },
  { q: "Bagaimana untuk membuat bayaran balik?", a: "Anda boleh membuat bayaran melalui dompet anda atau kaedah pembayaran yang tersedia." },
];

export default function SupportPage() {
  return (
    <div>
      <div style={{ padding: "20px 20px 16px", animation: "fadeInUp 0.4s ease both" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--accent-blue)", marginBottom: 4 }}>Perkhidmat Pelanggan</p>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Boleh kami <span style={{ color: "var(--accent-blue-light)" }}>bantu?</span></h1>
      </div>
      <div style={{ padding: "0 20px 20px", animation: "fadeInUp 0.4s ease 0.1s both" }}>
        <div className="card" style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(59,109,255,0.08)", border: "1px solid rgba(59,109,255,0.2)" }}>
          <Clock size={18} color="var(--accent-blue-light)" />
          <div><p style={{ fontSize: 13, fontWeight: 600 }}>Waktu Operasi</p><p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Isnin - Jumaat: 9:00 AM - 6:00 PM</p><p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Sabtu: 9:00 AM - 1:00 PM</p></div>
        </div>
      </div>
      <div style={{ padding: "0 20px 20px", animation: "fadeInUp 0.4s ease 0.2s both" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 12 }}>Hubungi Kami</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {contacts.map(({ icon: Icon, label, value, color, action }) => (
            <div key={label} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: \`\${color}18\`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={18} color={color} /></div>
                <div><p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 2 }}>{label}</p><p style={{ fontSize: 14, fontWeight: 600 }}>{value}</p></div>
              </div>
              <button style={{ background: "var(--accent-blue)", border: "none", borderRadius: 10, padding: "8px 14px", color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{action}</button>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 20px", animation: "fadeInUp 0.4s ease 0.3s both" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 12 }}>Soalan Lazim</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {faq.map(({ q, a }) => (
            <details key={q} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
              <summary style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between", listStyle: "none", userSelect: "none" }}>
                {q}<ChevronRight size={16} color="var(--text-muted)" />
              </summary>
              <div style={{ padding: "0 16px 14px", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
`);

console.log('\n✅ Semua files berjaya dibuat!');
console.log('🚀 Jalankan: npm run dev');
console.log('🌐 Buka: http://localhost:3000\n');
