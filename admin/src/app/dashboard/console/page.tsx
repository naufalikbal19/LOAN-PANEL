"use client";
import StatsCard from "@/components/StatsCard";
import { TrendingUp, AlertTriangle, Clock, CheckCircle } from "lucide-react";

const recentLoans = [
  { id: "LN-0012", name: "Ahmad Zulkifli", amount: "RM 15,000", status: "active",   date: "19 Apr 2026" },
  { id: "LN-0011", name: "Siti Aminah",    amount: "RM 8,000",  status: "pending",  date: "18 Apr 2026" },
  { id: "LN-0010", name: "Mohd Faizal",    amount: "RM 22,000", status: "problem",  date: "17 Apr 2026" },
  { id: "LN-0009", name: "Nur Hidayah",    amount: "RM 5,000",  status: "settled",  date: "16 Apr 2026" },
  { id: "LN-0008", name: "Razif Hassan",   amount: "RM 30,000", status: "active",   date: "15 Apr 2026" },
];

const statusStyle: Record<string, { label: string; bg: string; color: string }> = {
  active:  { label: "Aktif",    bg: "rgba(201,168,76,0.12)",  color: "#c9a84c" },
  pending: { label: "Pending",  bg: "rgba(59,130,246,0.12)",  color: "#60a5fa" },
  problem: { label: "Bermasalah", bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
  settled: { label: "Lunas",    bg: "rgba(34,197,94,0.12)",   color: "#22c55e" },
};

export default function ConsolePage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Console</h1>
        <p style={{ color: "#888", fontSize: 13 }}>Ringkasan keseluruhan data pinjaman</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatsCard label="Jumlah Keseluruhan" value="RM 1.2M" sub="142 pinjaman" icon="💰" color="#c9a84c" trend={{ value: "12%", up: true }} />
        <StatsCard label="Bermasalah"          value="18"      sub="RM 186,000"  icon="⚠️" color="#ef4444" trend={{ value: "3%",  up: false }} />
        <StatsCard label="Dalam Proses"        value="34"      sub="Menunggu kelulusan" icon="⏳" color="#60a5fa" trend={{ value: "8%", up: true }} />
        <StatsCard label="Lunas"               value="90"      sub="RM 840,000"  icon="✅" color="#22c55e" trend={{ value: "24%", up: true }} />
      </div>

      {/* Recent Loans Table */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #1e1e1e", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>Pinjaman Terkini</h2>
          <span style={{ fontSize: 12, color: "#888" }}>5 rekod terbaru</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#0c0c0c" }}>
                {["ID", "Nama", "Jumlah", "Status", "Tarikh"].map((h) => (
                  <th key={h} style={{ padding: "12px 22px", textAlign: "left", color: "#888", fontWeight: 600, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLoans.map((loan, i) => {
                const s = statusStyle[loan.status];
                return (
                  <tr key={loan.id} style={{ borderTop: "1px solid #1a1a1a", background: i % 2 === 0 ? "transparent" : "#0a0a0a" }}>
                    <td style={{ padding: "14px 22px", fontWeight: 700, color: "#c9a84c", fontFamily: "monospace" }}>{loan.id}</td>
                    <td style={{ padding: "14px 22px", color: "#fff", fontWeight: 500 }}>{loan.name}</td>
                    <td style={{ padding: "14px 22px", fontWeight: 700, color: "#fff" }}>{loan.amount}</td>
                    <td style={{ padding: "14px 22px" }}>
                      <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>{s.label}</span>
                    </td>
                    <td style={{ padding: "14px 22px", color: "#888" }}>{loan.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
