"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, FileText } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Loan {
  id: number; amount: number; loan_terms: string; status: string;
  created_at: string; sign_url: string | null;
}

const ARTICLES: [string, string][] = [
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
];

export default function LoanContractPage() {
  const [loan, setLoan] = useState<Loan | null>(null);
  const [userName, setUserName] = useState("");
  const [userIc, setUserIc] = useState("");
  const [loading, setLoading] = useState(true);
  const [noLoan, setNoLoan] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch<any>("/auth/me").catch(() => null),
      apiFetch<Loan[]>("/loans/my").catch(() => []),
    ]).then(([user, loans]) => {
      if (user) { setUserName(user.name ?? ""); setUserIc(user.ic ?? ""); }
      const latest = Array.isArray(loans) && loans.length > 0 ? loans[0] : null;
      if (latest) setLoan(latest);
      else setNoLoan(true);
    }).finally(() => setLoading(false));
  }, []);

  const months = parseInt(loan?.loan_terms ?? "0") || 0;
  const monthlyPayment = months > 0 && loan ? (loan.amount * (1 + 0.007 * months)) / months : 0;
  const signDate = loan
    ? new Date(loan.created_at).toLocaleString("en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "";
  const loanNumber = loan
    ? `99${loan.id}${new Date(loan.created_at).toISOString().slice(0,10).replace(/-/g,"")}`
    : "";

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
          <p style={{ fontSize: 18, fontWeight: 800 }}>Loan Contract</p>
          <p style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--text-secondary)", textTransform: "uppercase" }}>Surat Perjanjian Pinjaman</p>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, padding: "60px 0" }}>Memuatkan...</p>
      ) : noLoan ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: 40, marginBottom: 14 }}>📄</p>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Tiada Kontrak Pinjaman</p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Anda belum mempunyai permohonan pinjaman yang direkodkan.</p>
          <Link href="/dashboard/apply">
            <button style={{ background: "var(--accent-blue)", border: "none", borderRadius: 12, padding: "12px 28px", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Mohon Pinjaman
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ padding: "0 20px", animation: "fadeInUp 0.4s ease 0.1s both" }}>
          {/* Contract card */}
          <div style={{ background: "#ffffff", borderRadius: 24, padding: "28px 24px 24px", color: "#374151", lineHeight: 1.75, fontSize: 13, boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}>

            {/* Title */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>
              <FileText size={20} color="#111827" />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>Surat Perjanjian</h2>
            </div>

            {/* Header info */}
            <p style={{ textAlign: "center", fontWeight: 800, fontSize: 15, marginBottom: 16, color: "#111827" }}>LOAN CONTRACT</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20, background: "#f9fafb", borderRadius: 12, padding: "14px 16px", border: "1px solid #e5e7eb" }}>
              <Row label="Party A (Lender)" value="LOAN AGENCY" />
              <Row label="Party B (Borrower) Mr. / Mrs" value={userName.toUpperCase() || "—"} />
              <Row label="Loan Number" value={loanNumber} />
              <Row label="Identification Card No" value={userIc || "—"} />
              <Row label="Sign day" value={signDate} />
              <Row label="Loan amount" value={`RM ${Number(loan!.amount).toFixed(2)}`} />
              <Row label="Repayment period" value={months ? String(months) : "—"} />
              <Row label="Loan interest rate" value="0.70%" />
              <Row label="Month payment" value={monthlyPayment > 0 ? `RM ${monthlyPayment.toFixed(2)}` : "—"} />
            </div>

            <p style={{ marginBottom: 20, color: "#374151" }}>
              <strong>"Installment Agreement"</strong>, the Lender and the Borrower agree to and jointly abide by this Agreement. Adhering to the principles of equity, voluntary, honesty and reputation, there is no consensus, this small loan agreement is signed and ensures compliance and performance by the parties.
            </p>

            {/* Articles */}
            {ARTICLES.map(([title, body]) => (
              <div key={title} style={{ marginBottom: 16 }}>
                <p style={{ fontWeight: 700, color: "#111827", marginBottom: 4 }}>{title}</p>
                {body.split("\n").map((line, i) => (
                  <p key={i} style={{ marginBottom: 2, color: "#374151" }}>{line}</p>
                ))}
              </div>
            ))}

            {/* Signatures */}
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 80, height: 48, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 8 }}>🏛️</div>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>Money Lending</p>
                <p style={{ fontSize: 11, color: "#6b7280" }}>LOAN AGENCY</p>
              </div>
              <div style={{ textAlign: "center" }}>
                {loan?.sign_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={loan.sign_url} alt="Signature" style={{ maxWidth: 110, maxHeight: 60, objectFit: "contain", marginBottom: 8, border: "1px solid #e5e7eb", borderRadius: 8, padding: 4, background: "#fff" }} />
                ) : (
                  <div style={{ width: 110, height: 52, border: "1px dashed #d1d5db", borderRadius: 8, marginBottom: 8 }} />
                )}
                <p style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{userName.toUpperCase() || "—"}</p>
                <p style={{ fontSize: 11, color: "#6b7280" }}>Peminjam</p>
              </div>
            </div>
          </div>

          {/* Back button */}
          <Link href="/dashboard/account">
            <button style={{ marginTop: 16, width: "100%", background: "#111827", border: "none", borderRadius: 14, padding: "14px 0", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Kembali ke Akaun
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontWeight: 700, color: "#111827", minWidth: 180, flexShrink: 0 }}>{label} :</span>
      <span style={{ color: "#374151", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}
