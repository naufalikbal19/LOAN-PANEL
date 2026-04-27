"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Upload, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Loan {
  id: number;
  amount: number;
  loan_terms: string;
  status: string;
  created_at: string;
}

interface Repayment {
  id: number;
  installment_no: number;
  amount: number;
  due_date: string;
  receipt_url: string | null;
  status: "pending" | "approved" | "rejected";
  note: string | null;
  created_at: string;
}

function nextDueDate(fromDate?: string): { date: Date; label: string } {
  const ref = fromDate ? new Date(fromDate) : new Date();
  const now = new Date();
  let target = new Date(now.getFullYear(), now.getMonth(), 10);
  if (now.getDate() >= 10) target.setMonth(target.getMonth() + 1);
  return {
    date: target,
    label: target.toLocaleDateString("ms-MY", { day: "2-digit", month: "2-digit", year: "numeric" }),
  };
}

function monthlyPayment(amount: number, months: number): number {
  return (amount * (1 + 0.007 * months)) / months;
}

function parseMonths(terms: string): number {
  return parseInt(terms) || 12;
}

const statusConfig = {
  pending:  { label: "Menunggu",   color: "#f59e0b", icon: Clock },
  approved: { label: "Diluluskan", color: "#22c55e", icon: CheckCircle },
  rejected: { label: "Ditolak",    color: "#ef4444", icon: XCircle },
};

export default function RepaymentPage() {
  const [loan, setLoan] = useState<Loan | null>(null);
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<Loan[]>("/loans/my").catch(() => [] as Loan[]),
      apiFetch<Repayment[]>("/repayments/my").catch(() => [] as Repayment[]),
    ]).then(([loans, reps]) => {
      setLoan(Array.isArray(loans) && loans.length > 0 ? loans[0] : null);
      setRepayments(Array.isArray(reps) ? reps : []);
    }).finally(() => setLoading(false));
  }, []);

  const months = loan ? parseMonths(loan.loan_terms) : 0;
  const monthly = loan ? monthlyPayment(Number(loan.amount), months) : 0;
  const nextInstallment = repayments.filter((r) => r.status !== "rejected").length + 1;
  const { label: dueDateLabel, date: dueDate } = nextDueDate();
  const orderId = loan ? `#ORD-${String(loan.id).padStart(5, "0")}` : "—";
  const startDate = loan ? new Date(loan.created_at).toLocaleDateString("ms-MY", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

  const hasPendingThisInstallment = repayments.some(
    (r) => r.installment_no === nextInstallment && r.status === "pending"
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload gagal.");
      const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${data.url}`;
      setReceiptUrl(fullUrl);
      setPreviewUrl(fullUrl);
    } catch (err: any) {
      setError(err.message || "Upload gagal.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!loan) return;
    if (!receiptUrl) { setError("Sila muat naik resit pembayaran."); return; }
    setSubmitting(true);
    setError("");
    try {
      await apiFetch("/repayments", {
        method: "POST",
        body: JSON.stringify({
          loan_id: loan.id,
          amount: monthly.toFixed(2),
          installment_no: nextInstallment,
          due_date: dueDate.toISOString().slice(0, 10),
          receipt_url: receiptUrl,
        }),
      });
      setSuccess("Bukti pembayaran berjaya dihantar! Sila tunggu kelulusan admin.");
      setShowModal(false);
      setReceiptUrl("");
      setPreviewUrl("");
      const reps = await apiFetch<Repayment[]>("/repayments/my").catch(() => [] as Repayment[]);
      setRepayments(Array.isArray(reps) ? reps : []);
    } catch (err: any) {
      setError(err.message || "Gagal menghantar. Sila cuba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setReceiptUrl("");
    setPreviewUrl("");
    setError("");
  };

  const statusInfo = loan
    ? loan.status === "loan_approved" ? { label: "AKTIF", color: "#22c55e" }
    : loan.status === "under_review"  ? { label: "DALAM SEMAKAN", color: "#f59e0b" }
    : { label: loan.status.replace(/_/g, " ").toUpperCase(), color: "#888" }
    : null;

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 16px", animation: "fadeInUp 0.4s ease both" }}>
        <Link href="/dashboard/account">
          <button style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }}>
            <ChevronLeft size={18} />
          </button>
        </Link>
        <div>
          <p style={{ fontSize: 18, fontWeight: 800 }}>Repayment</p>
          <p style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--text-secondary)", textTransform: "uppercase" }}>Bayaran Balik Pinjaman</p>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, padding: "60px 20px" }}>Memuatkan...</p>
      ) : !loan ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
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
        <>
          {/* Success banner */}
          {success && (
            <div style={{ margin: "0 20px 16px", padding: "12px 16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12 }}>
              <p style={{ fontSize: 13, color: "#22c55e", fontWeight: 600 }}>{success}</p>
            </div>
          )}

          {/* Tagihan Seterusnya Card */}
          <div style={{ padding: "0 20px 20px", animation: "fadeInUp 0.4s ease 0.05s both" }}>
            <div style={{ background: "linear-gradient(135deg, #c9a84c 0%, #a88a38 100%)", borderRadius: 18, padding: "22px 20px 20px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -20, top: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
              <div style={{ position: "absolute", right: 30, bottom: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", marginBottom: 6 }}>Tagihan Seterusnya</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>JUMLAH YANG PERLU DIBAYAR</p>
              <p style={{ fontSize: 32, fontWeight: 900, color: "white", marginBottom: 18, lineHeight: 1 }}>
                RM {monthly.toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.8 }}>Ansuran Ke</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "white" }}>{nextInstallment} / {months}</p>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
                <div>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.8 }}>Tarikh Jatuh Tempo</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "white" }}>{dueDateLabel}</p>
                </div>
              </div>
              {hasPendingThisInstallment ? (
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={14} color="white" />
                  <p style={{ fontSize: 12, color: "white", fontWeight: 600 }}>Resit dihantar — menunggu kelulusan admin</p>
                </div>
              ) : (
                <button
                  onClick={() => { setError(""); setShowModal(true); }}
                  style={{ background: "white", border: "none", borderRadius: 12, padding: "12px 28px", color: "#a88a38", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  <Upload size={15} /> Bayar Sekarang
                </button>
              )}
            </div>
          </div>

          {/* Data Pinjaman */}
          <div style={{ padding: "0 20px 20px", animation: "fadeInUp 0.4s ease 0.1s both" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 10 }}>Data Pinjaman</p>
            <div className="card" style={{ padding: "18px 18px 4px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 800 }}>{orderId}</p>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: statusInfo!.color, background: `${statusInfo!.color}1e`, borderRadius: 6, padding: "3px 10px" }}>{statusInfo!.label}</span>
              </div>
              {[
                { label: "TENOR",                  value: loan.loan_terms || "—" },
                { label: "JUMLAH PINJAMAN",         value: `RM ${Number(loan.amount).toLocaleString("ms-MY", { minimumFractionDigits: 2 })}` },
                { label: "TARIKH MULA PEMBAYARAN",  value: startDate },
                { label: "BAYARAN BULANAN",         value: `RM ${monthly.toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / bulan` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid var(--border-color)" }}>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.5 }}>{label}</p>
                  <p style={{ fontSize: 13, fontWeight: 700 }}>{value}</p>
                </div>
              ))}
              <div style={{ padding: "12px 0", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end" }}>
                <Link href="/dashboard/account/loan-contract">
                  <button style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid var(--border-light)", borderRadius: 8, padding: "8px 14px", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    <Eye size={13} /> Lihat Kontrak
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Repayment History */}
          {repayments.length > 0 && (
            <div style={{ padding: "0 20px 20px", animation: "fadeInUp 0.4s ease 0.15s both" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 10 }}>Rekod Pembayaran</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {repayments.map((r) => {
                  const cfg = statusConfig[r.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={r.id} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${cfg.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <StatusIcon size={18} color={cfg.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Ansuran Ke-{r.installment_no}</p>
                        <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                          RM {Number(r.amount).toLocaleString("ms-MY", { minimumFractionDigits: 2 })} · {new Date(r.created_at).toLocaleDateString("ms-MY")}
                        </p>
                        {r.note && <p style={{ fontSize: 11, color: cfg.color, marginTop: 4 }}>{r.note}</p>}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, background: `${cfg.color}18`, borderRadius: 6, padding: "3px 8px" }}>{cfg.label}</span>
                        {r.receipt_url && (
                          <a href={r.receipt_url} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginTop: 6, textDecoration: "underline" }}>Lihat Resit</a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
          <div style={{ background: "var(--bg-secondary)", borderRadius: 24, padding: "24px 20px 28px", width: "100%", maxWidth: 430, animation: "fadeInUp 0.3s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <p style={{ fontSize: 17, fontWeight: 800 }}>Hantar Bukti Pembayaran</p>
              <button onClick={closeModal} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "var(--text-secondary)" }}>✕</button>
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "12px 16px", marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Ansuran Ke</p>
                <p style={{ fontSize: 13, fontWeight: 700 }}>{nextInstallment} / {months}</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Jumlah Dibayar</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-blue)" }}>RM {monthly.toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>

            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>Muat Naik Resit</p>

            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${previewUrl ? "var(--accent-blue)" : "var(--border-color)"}`, borderRadius: 14, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", minHeight: 140, position: "relative", overflow: "hidden", background: "var(--bg-card)", marginBottom: 16 }}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="receipt" style={{ maxHeight: 160, maxWidth: "100%", objectFit: "contain", borderRadius: 8 }} />
              ) : uploading ? (
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Memuat naik...</p>
              ) : (
                <>
                  <Upload size={28} color="var(--text-muted)" style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "center" }}>Ketik untuk pilih gambar resit</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>JPG, PNG, max 5MB</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

            {error && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 12 }}>{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting || uploading || !receiptUrl}
              style={{ width: "100%", background: "linear-gradient(135deg, var(--accent-blue), var(--accent-blue-hover))", border: "none", borderRadius: 14, padding: "15px", color: "white", fontSize: 15, fontWeight: 800, cursor: submitting || uploading || !receiptUrl ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: submitting || uploading || !receiptUrl ? 0.6 : 1 }}
            >
              {submitting ? "Menghantar..." : "Hantar Bukti Pembayaran"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
