"use client";
import { Search, Filter } from "lucide-react";

export default function WithdrawalPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Withdrawal Records</h1>
        <p style={{ color: "#888", fontSize: 13 }}>Rekod pengeluaran wang pelanggan</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#888" }} />
          <input placeholder="Cari rekod pengeluaran..." style={{ background: "#161616", border: "1px solid #242424", borderRadius: 10, padding: "10px 12px 10px 36px", color: "#fff", fontSize: 13, width: "100%", outline: "none", fontFamily: "inherit" }} />
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#161616", border: "1px solid #242424", borderRadius: 10, padding: "10px 16px", color: "#888", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
          <Filter size={14} /> Tapis
        </button>
      </div>

      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#0c0c0c" }}>
                {["ID", "Pelanggan", "Akaun Bank", "Jumlah", "Status", "Tarikh"].map((h) => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", color: "#888", fontWeight: 600, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} style={{ padding: "48px 20px", textAlign: "center", color: "#666" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Tiada rekod</p>
                  <p style={{ fontSize: 12 }}>Struktur jadual akan dikonfigurasi nanti</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
