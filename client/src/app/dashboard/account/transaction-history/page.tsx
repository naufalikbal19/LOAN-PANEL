"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const txTypeLabel: Record<string, string> = {
  withdrawal: "Pengeluaran",
  credit:     "Kredit",
  debit:      "Debit",
  adjustment: "Pelarasan",
};
const txTypeColor: Record<string, string> = {
  withdrawal: "#ef4444",
  credit:     "#22c55e",
  debit:      "#f59e0b",
  adjustment: "#6366f1",
};
const txEmoji: Record<string, string> = {
  withdrawal: "💸",
  credit:     "💰",
  debit:      "📤",
  adjustment: "🔄",
};

interface Tx { id: number; type: string; amount: number; description: string | null; created_at: string; }

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Tx[]>("/transactions/my")
      .then(setTransactions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = transactions.reduce((sum, t) => {
    if (t.type === "credit" || t.type === "adjustment") return sum + Number(t.amount);
    return sum - Number(t.amount);
  }, 0);

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 16px", animation: "fadeInUp 0.4s ease both" }}>
        <Link href="/dashboard/account">
          <button style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }}>
            <ChevronLeft size={18} />
          </button>
        </Link>
        <div>
          <p style={{ fontSize: 18, fontWeight: 800 }}>Sejarah Transaksi</p>
          <p style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--text-secondary)", textTransform: "uppercase" }}>Transaction History</p>
        </div>
      </div>

      {/* Summary card */}
      {!loading && transactions.length > 0 && (
        <div style={{ padding: "0 20px 16px", animation: "fadeInUp 0.4s ease 0.1s both" }}>
          <div className="card" style={{ background: "linear-gradient(135deg,#1a1a1a,#0a0a0a)", border: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>JUMLAH TRANSAKSI</p>
              <p style={{ fontSize: 22, fontWeight: 900 }}>{transactions.length}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>BAKI TRANSAKSI</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: total >= 0 ? "#22c55e" : "#ef4444" }}>
                {total >= 0 ? "+" : ""}RM {Math.abs(total).toLocaleString("ms-MY", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "0 20px", animation: "fadeInUp 0.4s ease 0.15s both" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, padding: "40px 0" }}>Memuatkan...</p>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
            <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Tiada transaksi</p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Sejarah transaksi anda akan muncul di sini.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {transactions.map((t) => {
              const color = txTypeColor[t.type] ?? "#c9a84c";
              const sign = t.type === "credit" || t.type === "adjustment" ? "+" : "-";
              const dateStr = new Date(t.created_at).toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" });
              const timeStr = new Date(t.created_at).toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={t.id} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {txEmoji[t.type] ?? "💳"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700 }}>{txTypeLabel[t.type] ?? t.type}</p>
                    {t.description && <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.4 }}>{t.description}</p>}
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{dateStr} · {timeStr}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color }}>{sign}RM {Number(t.amount).toLocaleString("ms-MY", { minimumFractionDigits: 2 })}</p>
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.8, color, background: `${color}18`, borderRadius: 6, padding: "2px 6px", display: "inline-block", marginTop: 4, textTransform: "uppercase" }}>
                      {txTypeLabel[t.type] ?? t.type}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
