"use client";
import { Eye, EyeOff, ChevronLeft, Info, ArrowDownToLine, CheckCircle, X, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const payments = [
  { id: "boost",   label: "Boost",   emoji: "⚡", bg: "#fef2f2" },
  { id: "gxbank",  label: "GXBank",  emoji: "🏦", bg: "#eff6ff" },
  { id: "ewallet", label: "eWallet", emoji: "💳", bg: "#f5f3ff" },
  { id: "maybank", label: "Maybank", emoji: "🏧", bg: "#fffbeb" },
  { id: "cimb",    label: "CIMB",    emoji: "🔴", bg: "#fef2f2" },
  { id: "rhb",     label: "RHB",     emoji: "🟢", bg: "#ecfdf5" },
];

const statusLabel: Record<string, string> = {
  under_review:        "Sedang Semakan",
  loan_approved:       "Pinjaman Diluluskan",
  credit_frozen:       "Kredit Dibekukan",
  unfrozen_processing: "Proses Pencairan",
  credit_score_low:    "Skor Kredit Rendah",
  payment_processing:  "Proses Pembayaran",
  loan_being_canceled: "Pinjaman Dibatalkan",
};

const txTypeLabel: Record<string, string> = {
  withdrawal:  "Pengeluaran",
  credit:      "Kredit",
  debit:       "Debit",
  adjustment:  "Pelarasan",
};

const txTypeColor: Record<string, string> = {
  withdrawal:  "#ef4444",
  credit:      "#22c55e",
  debit:       "#f59e0b",
  adjustment:  "#6366f1",
};

function maskPhone(phone: string) {
  if (!phone) return "—";
  return phone.slice(0, 3) + "****" + phone.slice(-4);
}

interface Loan { id: number; amount: number; loan_terms: string; status: string; created_at: string; }
interface Tx { id: number; type: string; amount: number; description: string | null; created_at: string; }

export default function WalletPage() {
  const [show, setShow] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [loans, setLoans] = useState<Loan[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  // Withdraw modal state
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [wdPassword, setWdPassword] = useState("");
  const [wdLoading, setWdLoading] = useState(false);
  const [wdError, setWdError] = useState("");
  const [wdSuccess, setWdSuccess] = useState<{ amount: number } | null>(null);
  const [showWdPwd, setShowWdPwd] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      apiFetch("/auth/me").catch(() => null),
      apiFetch<Loan[]>("/loans/my").catch(() => []),
      apiFetch<Tx[]>("/transactions/my").catch(() => []),
    ]).then(([user, myLoans, myTx]) => {
      if (user) {
        setBalance(parseFloat(user.balance ?? 0));
        setPhone(user.phone ?? "");
      }
      setLoans(Array.isArray(myLoans) ? myLoans : []);
      setTransactions(Array.isArray(myTx) ? myTx : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const latestLoan = loans[0] ?? null;
  const canWithdraw = latestLoan?.status === "loan_approved" && (balance ?? 0) > 0;

  const handleWithdraw = async () => {
    setWdError("");
    if (!wdPassword) { setWdError("Sila masukkan kata laluan pengeluaran."); return; }
    setWdLoading(true);
    try {
      const result = await apiFetch<{ message: string; amount: number }>("/transactions/withdraw", {
        method: "POST",
        body: JSON.stringify({ withdrawal_password: wdPassword }),
      });
      setWdSuccess({ amount: result.amount });
      setBalance(0);
      // Reload transactions
      apiFetch<Tx[]>("/transactions/my").then(setTransactions).catch(() => {});
    } catch (e: any) {
      setWdError(e.message || "Pengeluaran gagal. Sila cuba semula.");
    } finally {
      setWdLoading(false);
    }
  };

  const closeWithdrawModal = () => {
    setShowWithdraw(false);
    setWdPassword("");
    setWdError("");
    setWdSuccess(null);
    setShowWdPwd(false);
  };

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
                <div><p style={{ fontSize: 13, fontWeight: 700 }}>WALLET</p><p style={{ fontSize: 10, color: "#888", letterSpacing: 1 }}>SECURE PAGE</p></div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-green)", boxShadow: "0 0 8px rgba(34,197,94,0.6)" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: "#888", marginBottom: 6, letterSpacing: 0.5 }}>AKAUN SAYA</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <p style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, color: "white" }}>
                  {loading ? "..." : show ? `RM ${balance !== null ? Number(balance).toLocaleString("ms-MY", { minimumFractionDigits: 2 }) : "0.00"}` : "RM ••••"}
                </p>
                <button onClick={() => setShow(!show)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "#888", display: "flex", alignItems: "center" }}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Akaun no: {phone ? maskPhone(phone) : "—"}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 16px" }}>
              <div>
                <p style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>
                  {latestLoan ? (statusLabel[latestLoan.status] ?? latestLoan.status) : "Tiada Pinjaman"}
                </p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "white" }}>
                  {latestLoan ? `RM ${Number(latestLoan.amount).toLocaleString()}` : "—"}
                </p>
              </div>
              <button
                onClick={() => canWithdraw ? setShowWithdraw(true) : undefined}
                disabled={!canWithdraw}
                title={!canWithdraw ? (latestLoan?.status !== "loan_approved" ? "Pinjaman belum diluluskan" : "Tiada baki untuk dikeluarkan") : ""}
                style={{
                  background: canWithdraw ? "linear-gradient(135deg,#22c55e,#16a34a)" : "rgba(255,255,255,0.1)",
                  border: "none", borderRadius: 8, padding: "8px 16px", color: canWithdraw ? "white" : "#666",
                  fontSize: 12, fontWeight: 700, cursor: canWithdraw ? "pointer" : "not-allowed",
                  fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.2s",
                }}
              >
                <ArrowDownToLine size={14} /> WITHDRAW
              </button>
            </div>
            {latestLoan && latestLoan.status !== "loan_approved" && (
              <p style={{ fontSize: 11, color: "#f59e0b", marginTop: 10, textAlign: "center" }}>
                ⚠ Pengeluaran hanya tersedia selepas pinjaman diluluskan
              </p>
            )}
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

      {/* Transaction History */}
      <div style={{ padding: "0 20px 20px", animation: "fadeInUp 0.4s ease 0.3s both" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 14 }}>Sejarah Transaksi</p>
        {loading ? (
          <p style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "center", padding: 20 }}>Memuatkan...</p>
        ) : transactions.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "center", padding: 20 }}>Tiada rekod transaksi.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {transactions.map((t) => {
              const color = txTypeColor[t.type] ?? "#c9a84c";
              const sign = t.type === "credit" || t.type === "adjustment" ? "+" : "-";
              return (
                <div key={t.id} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                      {t.type === "withdrawal" ? "💸" : t.type === "credit" ? "💰" : t.type === "debit" ? "📤" : "🔄"}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{txTypeLabel[t.type] ?? t.type}</p>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {t.description || new Date(t.created_at).toLocaleDateString("ms-MY")}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color }}>{sign}RM {Number(t.amount).toLocaleString()}</p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{new Date(t.created_at).toLocaleDateString("ms-MY")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Loan History */}
      <div style={{ padding: "0 20px 20px", animation: "fadeInUp 0.4s ease 0.35s both" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 14 }}>Sejarah Pinjaman</p>
        {loans.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "center", padding: 20 }}>Tiada rekod pinjaman.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {loans.map((l) => {
              const color = l.status === "loan_approved" ? "#22c55e" : l.status === "loan_being_canceled" || l.status === "credit_frozen" ? "#ef4444" : "#c9a84c";
              return (
                <div key={l.id} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📋</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{statusLabel[l.status] ?? l.status}</p>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{new Date(l.created_at).toLocaleDateString("ms-MY")}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color }}>RM {Number(l.amount).toLocaleString()}</p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{l.loan_terms || "—"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="info-banner" style={{ marginBottom: 16, animation: "fadeInUp 0.4s ease 0.4s both" }}>
        <Info size={16} color="var(--accent-blue-light)" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>Pengeluaran hanya dibenarkan selepas pinjaman mendapat status <strong>Diluluskan</strong>. Dana diproses dalam 1–3 hari bekerja.</p>
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={closeWithdrawModal}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-card)", borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 430, animation: "fadeInUp 0.3s ease both" }}>

            {wdSuccess ? (
              /* Success state */
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <CheckCircle size={36} color="#22c55e" />
                </div>
                <p style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Pengeluaran Berjaya!</p>
                <p style={{ fontSize: 28, fontWeight: 900, color: "#22c55e", marginBottom: 8 }}>RM {Number(wdSuccess.amount).toLocaleString("ms-MY", { minimumFractionDigits: 2 })}</p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>
                  Dana anda sedang diproses dan akan dikreditkan ke akaun bank dalam 1–3 hari bekerja.
                </p>
                <button onClick={closeWithdrawModal} style={{ width: "100%", background: "var(--accent-blue)", border: "none", borderRadius: 14, padding: 16, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  Tutup
                </button>
              </div>
            ) : (
              /* Password input state */
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 800 }}>Pengeluaran Dana</p>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Masukkan kata laluan pengeluaran anda</p>
                  </div>
                  <button onClick={closeWithdrawModal} style={{ width: 32, height: 32, borderRadius: 10, background: "var(--bg-card-inner)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
                    <X size={16} />
                  </button>
                </div>

                <div className="card" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", marginBottom: 20 }}>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>JUMLAH PENGELUARAN</p>
                  <p style={{ fontSize: 26, fontWeight: 900, color: "#22c55e" }}>RM {balance !== null ? Number(balance).toLocaleString("ms-MY", { minimumFractionDigits: 2 }) : "0.00"}</p>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
                    <Lock size={11} style={{ marginRight: 5, verticalAlign: "middle" }} />Kata Laluan Pengeluaran
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showWdPwd ? "text" : "password"}
                      value={wdPassword}
                      onChange={(e) => setWdPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleWithdraw()}
                      placeholder="6 digit kata laluan"
                      maxLength={10}
                      className="input-field"
                      style={{ paddingRight: 46 }}
                    />
                    <button onClick={() => setShowWdPwd(s => !s)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex" }}>
                      {showWdPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {wdError && (
                  <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                    <p style={{ fontSize: 13, color: "#ef4444" }}>{wdError}</p>
                  </div>
                )}

                <button
                  onClick={handleWithdraw}
                  disabled={wdLoading}
                  style={{ width: "100%", background: wdLoading ? "var(--bg-card-inner)" : "linear-gradient(135deg,#22c55e,#16a34a)", border: "none", borderRadius: 14, padding: 16, color: wdLoading ? "var(--text-muted)" : "white", fontSize: 15, fontWeight: 700, cursor: wdLoading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {wdLoading ? "Memproses..." : (<><ArrowDownToLine size={18} /> Sahkan Pengeluaran</>)}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
