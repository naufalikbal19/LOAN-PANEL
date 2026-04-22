"use client";
import StatsCard from "@/components/StatsCard";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  under_review:        { label: "Dalam Semakan",   bg: "rgba(59,130,246,0.12)",  color: "#60a5fa" },
  loan_approved:       { label: "Diluluskan",       bg: "rgba(34,197,94,0.12)",   color: "#22c55e" },
  credit_frozen:       { label: "Kredit Dibekukan", bg: "rgba(239,68,68,0.12)",   color: "#ef4444" },
  unfrozen_processing: { label: "Proses Cair",      bg: "rgba(59,130,246,0.12)",  color: "#60a5fa" },
  credit_score_low:    { label: "Skor Rendah",      bg: "rgba(239,68,68,0.12)",   color: "#ef4444" },
  payment_processing:  { label: "Proses Bayar",     bg: "rgba(201,168,76,0.12)",  color: "#c9a84c" },
  loan_being_canceled: { label: "Dibatalkan",       bg: "rgba(107,114,128,0.12)", color: "#9ca3af" },
};

function fmt(amount: number) {
  if (amount >= 1_000_000) return `RM ${(amount / 1_000_000).toFixed(1)}J`;
  if (amount >= 1_000) return `RM ${(amount / 1_000).toFixed(0)}K`;
  return `RM ${amount.toLocaleString("ms-MY")}`;
}

export default function ConsolePage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    fetch(`${API}/loans/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Console</h1>
        <p style={{ color: "#888", fontSize: 13 }}>Ringkasan keseluruhan data pinjaman</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatsCard
          label="Jumlah Keseluruhan"
          value={loading ? "—" : fmt(Number(stats?.totals?.total_amount ?? 0))}
          sub={loading ? "" : `${stats?.totals?.total_count ?? 0} pinjaman`}
          icon="💰" color="#c9a84c"
        />
        <StatsCard
          label="Bermasalah"
          value={loading ? "—" : String(stats?.problem?.count ?? 0)}
          sub={loading ? "" : fmt(Number(stats?.problem?.amount ?? 0))}
          icon="⚠️" color="#ef4444"
        />
        <StatsCard
          label="Dalam Proses"
          value={loading ? "—" : String(stats?.inprocess?.count ?? 0)}
          sub="Menunggu kelulusan"
          icon="⏳" color="#60a5fa"
        />
        <StatsCard
          label="Diluluskan"
          value={loading ? "—" : String(stats?.approved?.count ?? 0)}
          sub={loading ? "" : fmt(Number(stats?.approved?.amount ?? 0))}
          icon="✅" color="#22c55e"
        />
      </div>

      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #1e1e1e", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>Pinjaman Terkini</h2>
          <span style={{ fontSize: 12, color: "#888" }}>5 rekod terbaru</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#0c0c0c" }}>
                {["Order No.", "Nama", "Jumlah", "Status", "Tarikh"].map((h) => (
                  <th key={h} style={{ padding: "12px 22px", textAlign: "left", color: "#888", fontWeight: 600, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: "28px 22px", textAlign: "center", color: "#888" }}>Memuatkan...</td></tr>
              ) : !stats?.recent?.length ? (
                <tr><td colSpan={5} style={{ padding: "28px 22px", textAlign: "center", color: "#888" }}>Tiada rekod</td></tr>
              ) : stats.recent.map((loan: any, i: number) => {
                const s = STATUS_MAP[loan.status] ?? { label: loan.status, bg: "rgba(128,128,128,0.12)", color: "#888" };
                return (
                  <tr key={loan.id} style={{ borderTop: "1px solid #1a1a1a", background: i % 2 === 0 ? "transparent" : "#0a0a0a" }}>
                    <td style={{ padding: "14px 22px", fontWeight: 700, color: "#c9a84c", fontFamily: "monospace" }}>
                      #{`ORD-${String(loan.id).padStart(5, "0")}`}
                    </td>
                    <td style={{ padding: "14px 22px", color: "#fff", fontWeight: 500 }}>{loan.name}</td>
                    <td style={{ padding: "14px 22px", fontWeight: 700, color: "#fff" }}>
                      RM {Number(loan.amount).toLocaleString("ms-MY")}
                    </td>
                    <td style={{ padding: "14px 22px" }}>
                      <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>{s.label}</span>
                    </td>
                    <td style={{ padding: "14px 22px", color: "#888" }}>
                      {new Date(loan.created_at).toLocaleDateString("ms-MY", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
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
