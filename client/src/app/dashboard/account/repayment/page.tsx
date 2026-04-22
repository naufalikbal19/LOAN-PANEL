"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, FileText, Eye } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Loan {
  id: number; amount: number; loan_terms: string; status: string; created_at: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  loan_approved:       { label: "Aktif",              color: "#c9a84c" },
  under_review:        { label: "Dalam Semakan",      color: "#f59e0b" },
  credit_frozen:       { label: "Kredit Dibekukan",   color: "#ef4444" },
  unfrozen_processing: { label: "Proses Pencairan",   color: "#fb923c" },
  credit_score_low:    { label: "Skor Kredit Rendah", color: "#f87171" },
  payment_processing:  { label: "Proses Pembayaran",  color: "#818cf8" },
  loan_being_canceled: { label: "Dibatalkan",         color: "#9ca3af" },
};

function nextPaymentDate(): string {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), 10);
  if (now.getDate() >= 10) target.setMonth(target.getMonth() + 1);
  return target.toLocaleDateString("ms-MY", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid var(--border-color)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--accent-blue)", fontSize: 16, lineHeight: 1 }}>·</span>
        <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color: valueColor ?? "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

export default function RepaymentPage() {
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [noLoan, setNoLoan] = useState(false);

  useEffect(() => {
    apiFetch<Loan[]>("/loans/my")
      .then((loans) => {
        const latest = Array.isArray(loans) && loans.length > 0 ? loans[0] : null;
        if (latest) setLoan(latest);
        else setNoLoan(true);
      })
      .catch(() => setNoLoan(true))
      .finally(() => setLoading(false));
  }, []);

  const loanOrderNo = loan
    ? `#ORD${new Date(loan.created_at).toISOString().slice(0,10).replace(/-/g,"")}${loan.id}`
    : "";

  const status = loan ? (statusMap[loan.status] ?? { label: loan.status, color: "var(--text-primary)" }) : null;

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 16px", animation: "fadeInUp 0.4s ease both" }}>
        <Link href="/dashboard/account">
          <button style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }}>
            <ChevronLeft size={18} />
          </button>
        </Link>
        <div>
          <p style={{ fontSize: 18, fontWeight: 800 }}>Repayment</p>
          <p style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--text-secondary)", textTransform: "uppercase" }}>Jadual Bayaran Balik</p>
        </div>
      </div>

      <div style={{ padding: "0 20px", animation: "fadeInUp 0.4s ease 0.1s both" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, padding: "60px 0" }}>Memuatkan...</p>
        ) : noLoan ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 40, marginBottom: 14 }}>📅</p>
            <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Tiada Data Bayaran</p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Anda belum mempunyai pinjaman aktif.</p>
            <Link href="/dashboard/apply">
              <button style={{ background: "var(--accent-blue)", border: "none", borderRadius: 12, padding: "12px 28px", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Mohon Pinjaman
              </button>
            </Link>
          </div>
        ) : (
          <div className="card" style={{ padding: "20px 20px 18px" }}>
            {/* Card title */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, paddingBottom: 16, borderBottom: "1px solid var(--border-color)" }}>
              <FileText size={16} color="var(--accent-blue)" />
              <p style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.3 }}>Pinjaman {loanOrderNo}</p>
            </div>

            {/* Rows */}
            <Row
              label="Jumlah Dipinjam"
              value={`RM ${Number(loan!.amount).toLocaleString("ms-MY", { minimumFractionDigits: 2 })}`}
              valueColor="var(--accent-blue)"
            />
            <Row label="Kadar Faedah Bulanan" value="0.30%" />
            <Row label="Tempoh Bayaran" value={loan!.loan_terms || "—"} />
            <Row label="Tarikh Bayaran Seterusnya" value={nextPaymentDate()} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0 4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--accent-blue)", fontSize: 16, lineHeight: 1 }}>·</span>
                <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>Status</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: status!.color }}>{status!.label}</span>
            </div>

            {/* View Contract button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <Link href="/dashboard/account/loan-contract">
                <button style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "linear-gradient(135deg, var(--accent-blue), var(--accent-blue-hover))",
                  border: "none", borderRadius: 50, padding: "11px 22px",
                  color: "white", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit", letterSpacing: 0.3,
                }}>
                  <Eye size={14} /> Lihat Kontrak Penuh
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
