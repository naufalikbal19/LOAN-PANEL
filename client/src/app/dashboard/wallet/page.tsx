"use client";
import { Eye, EyeOff, ChevronLeft, Info, ArrowDownToLine, CheckCircle, X, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";

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
  transfer_failed:     "Pindahan Gagal",
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

interface Loan {
  id: number; amount: number; loan_terms: string; status: string; created_at: string;
  bank: string | null; no_rekening: string | null; sign_url: string | null; keterangan: string | null;
}
interface Tx { id: number; type: string; amount: number; description: string | null; created_at: string; }

export default function WalletPage() {
  const { withdrawal_warning } = useSettings();
  const [show, setShow] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [userName, setUserName] = useState("");
  const [userIc, setUserIc] = useState("");
  const [loans, setLoans] = useState<Loan[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  // Contract modal
  const [showContract, setShowContract] = useState(false);

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
        setUserName(user.name ?? "");
        setUserIc(user.ic ?? "");
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
        <div className="card" style={{ background: "linear-gradient(135deg, var(--bg-card-inner) 0%, var(--bg-primary) 100%)", border: "1px solid var(--border-light)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", right: -20, top: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(201,168,76,0.06)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Link href="/dashboard">
                  <button style={{ width: 32, height: 32, borderRadius: 10, background: "var(--bg-card-inner)", border: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }}>
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
                <p style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, color: "var(--text-primary)" }}>
                  {loading ? "..." : show ? `RM ${balance !== null ? Number(balance).toLocaleString("ms-MY", { minimumFractionDigits: 2 }) : "0.00"}` : "RM ••••"}
                </p>
                <button onClick={() => setShow(!show)} style={{ background: "var(--bg-card-inner)", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>Akaun no: {phone ? maskPhone(phone) : "—"}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-card-inner)", borderRadius: 12, padding: "12px 16px" }}>
              <div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 2 }}>
                  {latestLoan ? (statusLabel[latestLoan.status] ?? latestLoan.status) : "Tiada Pinjaman"}
                </p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                  {latestLoan ? `RM ${Number(latestLoan.amount).toLocaleString()}` : "—"}
                </p>
              </div>
              <button
                onClick={() => canWithdraw ? setShowWithdraw(true) : undefined}
                disabled={!canWithdraw}
                title={!canWithdraw ? (latestLoan?.status !== "loan_approved" ? "Pinjaman belum diluluskan" : "Tiada baki untuk dikeluarkan") : ""}
                style={{
                  background: canWithdraw ? "linear-gradient(135deg,#22c55e,#16a34a)" : "var(--bg-card-inner)",
                  border: "none", borderRadius: 8, padding: "8px 16px", color: canWithdraw ? "white" : "var(--text-muted)",
                  fontSize: 12, fontWeight: 700, cursor: canWithdraw ? "pointer" : "not-allowed",
                  fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.2s",
                }}
              >
                <ArrowDownToLine size={14} /> WITHDRAW
              </button>
            </div>
            {latestLoan?.keterangan && (
              <div style={{ marginTop: 10, background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.18)", borderRadius: 10, padding: "9px 12px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--accent-gold)", marginBottom: 3 }}>Butiran Pinjaman</p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{latestLoan.keterangan}</p>
              </div>
            )}
            {latestLoan && latestLoan.status === "under_review" && withdrawal_warning && (
              <p style={{ fontSize: 11, color: "#f59e0b", marginTop: 10, textAlign: "center" }}>
                {withdrawal_warning}
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

      {/* Loan Details */}
      {latestLoan && (
        <div style={{ padding: "0 20px 20px", animation: "fadeInUp 0.4s ease 0.25s both" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 14 }}>Butiran Pinjaman</p>
          <div className="card" style={{ padding: "18px 18px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 3 }}>NO. PERMOHONAN</p>
                <p style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.5 }}>#ORD-{String(latestLoan.id).padStart(5,"0")}</p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8,
                background: latestLoan.status === "loan_approved" ? "rgba(34,197,94,0.12)" : latestLoan.status === "loan_being_canceled" || latestLoan.status === "credit_frozen" || latestLoan.status === "transfer_failed" ? "rgba(239,68,68,0.1)" : "rgba(201,168,76,0.12)",
                color: latestLoan.status === "loan_approved" ? "#22c55e" : latestLoan.status === "loan_being_canceled" || latestLoan.status === "credit_frozen" || latestLoan.status === "transfer_failed" ? "#ef4444" : "#c9a84c",
              }}>{statusLabel[latestLoan.status] ?? latestLoan.status}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 8px", marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3 }}>JUMLAH PINJAMAN</p>
                <p style={{ fontSize: 14, fontWeight: 700 }}>RM {Number(latestLoan.amount).toLocaleString("ms-MY", { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3 }}>TEMPOH</p>
                <p style={{ fontSize: 14, fontWeight: 700 }}>{latestLoan.loan_terms || "—"}</p>
              </div>
              {latestLoan.bank && (
                <div>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3 }}>BANK</p>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{latestLoan.bank}</p>
                </div>
              )}
              {latestLoan.no_rekening && (
                <div>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3 }}>NO. AKAUN</p>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{latestLoan.no_rekening}</p>
                </div>
              )}
              <div>
                <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3 }}>TARIKH MOHON</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{new Date(latestLoan.created_at).toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" })}</p>
              </div>
            </div>
            <button
              onClick={() => setShowContract(true)}
              style={{ width: "100%", background: "linear-gradient(135deg,var(--accent-blue),var(--accent-blue-hover))", border: "none", borderRadius: 12, padding: "12px 0", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: 0.5 }}
            >
              📄 View Contract
            </button>
          </div>
        </div>
      )}

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
              const color = l.status === "loan_approved" ? "#22c55e" : l.status === "loan_being_canceled" || l.status === "credit_frozen" || l.status === "transfer_failed" ? "#ef4444" : "#c9a84c";
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
        <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>Pengeluaran hanya dibenarkan selepas pinjaman mendapat status <strong>Diluluskan</strong>. Sila semak akaun bank anda dalam masa 10-15 minit selepas pengeluaran.</p>
      </div>

      {/* Contract Modal */}
      {showContract && latestLoan && (() => {
        const months = parseInt(latestLoan.loan_terms ?? "0") || 0;
        const monthlyPayment = months > 0 ? (latestLoan.amount * (1 + 0.007 * months)) / months : 0;
        const signDate = new Date(latestLoan.created_at).toLocaleString("en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} onClick={() => setShowContract(false)}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", width: "100%", maxWidth: 640, height: "85vh", borderRadius: 36, padding: "28px 28px 20px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", position: "relative" }}>
              {/* Close top */}
              <button onClick={() => setShowContract(false)} style={{ position: "absolute", top: 18, right: 22, background: "none", border: "none", fontSize: 30, color: "#94a3b8", cursor: "pointer", lineHeight: 1 }}>×</button>

              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid #e5e7eb" }}>Surat Perjanjian</h2>

              {/* Scrollable body */}
              <div style={{ flex: 1, overflowY: "auto", color: "#374151", lineHeight: 1.75, fontSize: 13, paddingRight: 6 }}>
                <p style={{ textAlign: "center", marginBottom: 20 }}><strong>LOAN CONTRACT</strong></p>

                <p><strong>Party A (Lender) :</strong> LOAN AGENCY</p>
                <p><strong>Party B (Borrower) Mr. / Mrs :</strong> {userName.toUpperCase() || "—"}</p>
                <p><strong>Loan Number :</strong> {`99${latestLoan.id}${new Date(latestLoan.created_at).toISOString().slice(0,10).replace(/-/g,"")}`}</p>
                <p><strong>Identification Card No :</strong> {userIc || "—"}</p>
                <p><strong>Sign day :</strong> {signDate}</p>
                <p><strong>Loan amount :</strong> RM {Number(latestLoan.amount).toFixed(2)}</p>
                <p><strong>Repayment period :</strong> {months || "—"}</p>
                <p><strong>Loan interest rate :</strong> 0.70%</p>
                <p style={{ marginBottom: 16 }}><strong>Month payment :</strong> RM {monthlyPayment > 0 ? monthlyPayment.toFixed(2) : "—"}</p>

                <p style={{ marginBottom: 14 }}><strong>"Installment Agreement"</strong>, the Lender and the Borrower agree to and jointly abide by this Agreement. Adhering to the principles of equity, voluntary, honesty and reputation, there is no consensus, this small loan agreement is signed and ensures compliance and performance by the parties.</p>

                {[
                  ["Article 1", "Loan Form: Use an unsecured ID card to request a loan."],
                  ["Article 2", "Premium interest rate:\nInterest rates, fines, service charges or any fees. Total not more than 25% per year."],
                  ["Article 3", "During the loan tenure, the borrower has to:\n(1) Pay interest at the same time.\n(2) To give capital on time.\n(3) If it is not possible to borrow money from the account due to the borrower's problem, the borrower should cooperate with the lender to finalize the payment.\n(4) comply with all the terms of the contract."],
                  ["Article 4", "(1) In case the borrower borrows online without using collateral, the lender is at risk of lending. The borrower must have a loan guarantee to check the liquidity of the borrower's personal loan minimum repayment. Must be verified for financial liquidity.\n(2) In the case of online borrowers without collateral, the lenders run the risk of lending. Borrowers must show their financial status to the company to confirm their ability to repay their debts by 10%. The borrower will withdraw the full amount of the loan account.\n(3) After signing this contract, both the borrower and the lender must comply with all requirements of the contract. If either party breaches the contract, the other party has the right to sue in court.\n(4) In the event that the credit transfer cannot be resolved due to the problems of the borrower, the lender has the right to request the borrower to assist in handling it.\n(5) The borrower shall repay the loan principal and interest within the period specified in the contract. If the borrower wants to apply for loan extension, he/she has to disburse it 5 days before the contract period.\n(6) If the borrower does not repay on time on the stipulated repayment date, penalty interest will be calculated after three days at 0.5% per day."],
                  ["Article 5", "Lending: Before granting a loan, the lender has the right to consider the following matters:\n(1) The Borrower has entered into this Agreement Completion of legal formalities relating to the loan under the Act;\n(2) whether the Borrower has paid the costs associated with this Agreement;\n(3) whether the borrower has complied with the loan terms specified in this Agreement;\n(4) whether the business and financial position of the borrower has changed adversely;\n(5) If the Borrower breaches the terms specified in this Agreement."],
                  ["Article 6", "(1) The borrower cannot use the loan for illegal activities. Otherwise, the Lender reserves the right to require the Borrower to repay the principal and interest promptly.\n(2) The borrower shall repay the principal and interest within the period specified in the contract. For the overdue portion, the lender is entitled to recover the loan and collect 5% of the total amount due."],
                  ["Article 7", "Modification or termination of contract: In all of the above provisions, neither party is permitted to modify or terminate the contract without permission. When either party wishes to bring to the fore such facts in accordance with the provisions of the law, he must notify the other party in writing. After this Agreement is modified or terminated, the Borrower shall repay 30% to the principal and interest in accordance with the terms of this Agreement."],
                  ["Article 8", "Dispute Resolution: Both parties agree to amend the terms of this Agreement through negotiation. If the negotiations do not agree, you can ask the local arbitration committee to mediate or bring the matter to a local court."],
                  ["Article 9", "The lender assumes the credit risk of the borrower. Due to the \"new corona pandemic\", the central office requires borrowers to purchase personal accident insurance. If the borrower is unable to repay the loan on time due to force mature, the lender may ask the insurance company to assist in the payment. Half an hour after the purchase, if the borrower signs the contract but does not comply with the terms, the company considers it a serious fraud and will take the credit dispute to the people's court."],
                  ["Article 10", "This short loan agreement takes effect from the date of its signing by both parties (including the electronic agreement). The text of the contract has the same legal effect. The lender and borrower keep a copy of the contract."],
                  ["Article 11", "Automatic Monthly Repayment (Auto Debit)\n(1) The Borrower agrees that the repayment of loan principal and interest shall be made through an automatic debit (auto-debit) system on a monthly basis.\n(2) The auto-debit shall be executed on the 10th day of each month from the Borrower's designated bank account, e-wallet, or payment channel registered with the Lender.\n(3) The Borrower shall ensure that sufficient funds are available in the designated account before the auto-debit date. Any failure due to insufficient balance shall be deemed as late repayment and subject to penalties.\n(4) If the 10th day falls on a public holiday or non-banking day, the auto-debit shall be processed on the next working day.\n(5) Any changes to the auto-debit account details must be notified to the Lender in writing at least five (5) working days prior to the next scheduled auto-debit date.\n(6) The Borrower acknowledges and agrees that failure to comply with the auto-debit arrangement constitutes a breach of this Agreement."],
                ].map(([title, body]) => (
                  <div key={title} style={{ marginBottom: 14 }}>
                    <p style={{ fontWeight: 700, marginBottom: 4 }}>{title}</p>
                    {body.split("\n").map((line, i) => <p key={i} style={{ marginBottom: 2 }}>{line}</p>)}
                  </div>
                ))}

                {/* Signatures */}
                <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 22, marginBottom: 4 }}>🏛️</p>
                    <p style={{ fontWeight: 700, fontSize: 13 }}>Money Lending</p>
                    <p style={{ fontSize: 11, color: "#6b7280" }}>LOAN AGENCY</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    {latestLoan.sign_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={latestLoan.sign_url} alt="Signature" style={{ maxWidth: 100, maxHeight: 56, objectFit: "contain", marginBottom: 6, border: "1px solid #e5e7eb", borderRadius: 6, padding: 4 }} />
                    ) : (
                      <div style={{ width: 100, height: 48, border: "1px dashed #d1d5db", borderRadius: 6, marginBottom: 6 }} />
                    )}
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{userName.toUpperCase() || "—"}</p>
                    <p style={{ fontSize: 11, color: "#6b7280" }}>Peminjam</p>
                  </div>
                </div>
              </div>

              <button onClick={() => setShowContract(false)} style={{ marginTop: 14, width: "100%", padding: "14px 0", background: "#111827", color: "#fff", border: "none", borderRadius: 16, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Tutup Dokumen
              </button>
            </div>
          </div>
        );
      })()}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", paddingBottom: "calc(90px + env(safe-area-inset-bottom))" }} onClick={closeWithdrawModal}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-card)", borderRadius: 24, padding: "28px 24px 28px", width: "100%", maxWidth: 400, maxHeight: "80vh", overflowY: "auto", animation: "fadeInUp 0.3s ease both" }}>

            {wdSuccess ? (
              /* Success state */
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <CheckCircle size={36} color="#22c55e" />
                </div>
                <p style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Pengeluaran Berjaya!</p>
                <p style={{ fontSize: 28, fontWeight: 900, color: "#22c55e", marginBottom: 8 }}>RM {Number(wdSuccess.amount).toLocaleString("ms-MY", { minimumFractionDigits: 2 })}</p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>
                  Pengeluaran berjaya dikeluarkan! Sila semak akaun bank anda dalam masa 10-15 minit.
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
