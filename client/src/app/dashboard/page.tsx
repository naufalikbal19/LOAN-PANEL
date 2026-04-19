"use client";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";

const trustBadges = [
  { label: "PIDM", color: "#1a56db", text: "P" },
  { label: "KDN",  emoji: "🇲🇾" },
  { label: "CWSP", color: "#7c3aed", text: "C" },
  { label: "BNM",  color: "#0891b2", text: "B" },
];

export default function DashboardPage() {
  const { company_name, company_tagline } = useSettings();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setUserName(localStorage.getItem("user_name") || "");
  }, []);

  return (
    <div>
      <div className="page-header animate-fade-in-up" style={{ paddingTop: 24, paddingBottom: 20 }}>
        <p className="page-subtitle">Premium Membership</p>
        <h1 className="page-title">{company_tagline}</h1>
      </div>

      {/* Greeting Card */}
      <div style={{ padding: "0 20px 20px" }} className="animate-fade-in-up animate-delay-1">
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-green)", animation: "pulse-dot 2s ease infinite", flexShrink: 0 }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>Hai, {userName || "Pengguna"} 👋</span>
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
        <div className="card" style={{ background: "linear-gradient(135deg,#1a1a1a 0%,#0a0a0a 100%)", border: "1px solid var(--border-light)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.1)" }} />
          <div style={{ position: "relative" }}>
            <span className="badge-available" style={{ marginBottom: 12, display: "inline-flex" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)", display: "inline-block" }} />
              LIMIT TERSEDIA
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Hello, {userName || "Pengguna"} 👋</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8 }}>Loan limit up to (RM)</p>
            <p style={{ fontSize: 26, fontWeight: 900, marginBottom: 16 }}>RM 5,000 - 200,000</p>
            <button className="apply-btn">Apply Now <ArrowRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Company Banner */}
      <div style={{ padding: "0 20px 20px" }} className="animate-fade-in-up animate-delay-3">
        <div className="card" style={{ background: "linear-gradient(135deg,#1a1a1a 0%,#0a0a0a 100%)", border: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 16, overflow: "hidden" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, background: "rgba(201,168,76,0.12)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏢</div>
              <p style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.4 }}>{company_name}</p>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Pinjaman <span style={{ color: "var(--accent-blue-light)" }}>Kakitangan</span><br />Kerajaan</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>Pinjaman peribadi dengan tempoh bayaran fleksibel sehingga 72 bulan.</p>
            <button className="btn-outline" style={{ width: "auto", padding: "10px 20px", fontSize: 13 }}>Mohon Sekarang</button>
          </div>
          <div style={{ width: 80, height: 100, background: "rgba(201,168,76,0.06)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, flexShrink: 0 }}>👨‍💼</div>
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
