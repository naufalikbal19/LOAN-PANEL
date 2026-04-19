"use client";
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
        <div className="card" style={{ background: "linear-gradient(135deg,#1a1a1a 0%,#0a0a0a 100%)", border: "1px solid var(--border-light)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", right: -20, top: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(201,168,76,0.06)" }} />
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
                <div style={{ width: 38, height: 38, borderRadius: 12, background: `${t.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{t.amount.startsWith("+") ? "📥" : "📤"}</div>
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
