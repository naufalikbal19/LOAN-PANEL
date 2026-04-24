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

const loanStatusLabel: Record<string, string> = {
  under_review:        "Permohonan Dihantar",
  loan_approved:       "Pinjaman Diluluskan",
  credit_frozen:       "Kredit Dibekukan",
  unfrozen_processing: "Proses Pencairan Kredit",
  credit_score_low:    "Skor Kredit Rendah",
  payment_processing:  "Proses Pembayaran",
  loan_being_canceled: "Pinjaman Dibatalkan",
};
const loanStatusColor: Record<string, string> = {
  under_review:        "#60a5fa",
  loan_approved:       "#22c55e",
  credit_frozen:       "#ef4444",
  unfrozen_processing: "#60a5fa",
  credit_score_low:    "#ef4444",
  payment_processing:  "#c9a84c",
  loan_being_canceled: "#ef4444",
};
const loanStatusEmoji: Record<string, string> = {
  under_review:        "📋",
  loan_approved:       "✅",
  credit_frozen:       "🔒",
  unfrozen_processing: "🔓",
  credit_score_low:    "⚠️",
  payment_processing:  "💳",
  loan_being_canceled: "❌",
};

interface Tx { id: number; type: string; amount: number; description: string | null; created_at: string; }
interface Loan { id: number; amount: number; status: string; loan_terms: string; created_at: string; updated_at: string; }

type Entry =
  | { kind: "tx"; data: Tx }
  | { kind: "loan"; data: Loan };

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Tx[]>("/transactions/my").catch(() => []),
      apiFetch<Loan[]>("/loans/my").catch(() => []),
    ]).then(([txs, ls]) => {
      setTransactions(Array.isArray(txs) ? txs : []);
      setLoans(Array.isArray(ls) ? ls : []);
    }).finally(() => setLoading(false));
  }, []);

  const entries: Entry[] = [
    ...transactions.map((t): Entry => ({ kind: "tx", data: t })),
    ...loans.map((l): Entry => ({ kind: "loan", data: l })),
  ].sort((a, b) => {
    const dateA = new Date(a.kind === "tx" ? a.data.created_at : a.data.updated_at).getTime();
    const dateB = new Date(b.kind === "tx" ? b.data.created_at : b.data.updated_at).getTime();
    return dateB - dateA;
  });

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

      <div style={{ padding: "0 20px", animation: "fadeInUp 0.4s ease 0.1s both" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, padding: "40px 0" }}>Memuatkan...</p>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
            <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Tiada rekod</p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Sejarah transaksi anda akan muncul di sini.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.map((entry, i) => {
              if (entry.kind === "tx") {
                const t = entry.data;
                const color = txTypeColor[t.type] ?? "#c9a84c";
                const sign = t.type === "credit" || t.type === "adjustment" ? "+" : "-";
                const dateStr = new Date(t.created_at).toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" });
                const timeStr = new Date(t.created_at).toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={`tx-${t.id}`} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
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
              } else {
                const l = entry.data;
                const color = loanStatusColor[l.status] ?? "#888";
                const emoji = loanStatusEmoji[l.status] ?? "📋";
                const label = loanStatusLabel[l.status] ?? l.status;
                const dateStr = new Date(l.updated_at).toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" });
                const timeStr = new Date(l.updated_at).toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={`loan-${l.id}-${i}`} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700 }}>{label}</p>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                        #ORD-{String(l.id).padStart(5, "0")} · RM {Number(l.amount).toLocaleString("ms-MY")}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{dateStr} · {timeStr}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.8, color, background: `${color}18`, borderRadius: 6, padding: "2px 6px", display: "inline-block", textTransform: "uppercase" }}>
                        Pinjaman
                      </p>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}
