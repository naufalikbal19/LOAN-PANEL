"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, Banknote, Eye, EyeOff, Building2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

function mask(val: string): string {
  if (val.length <= 4) return "•".repeat(val.length);
  return val.slice(0, 2) + "•".repeat(val.length - 4) + val.slice(-2);
}

export default function WithdrawalPage() {
  const [bank, setBank]   = useState<string | null>(null);
  const [noRek, setNoRek] = useState<string | null>(null);
  const [show, setShow]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/auth/me"),
      apiFetch("/loans/my").catch(() => []),
    ]).then(([u, loans]: [any, any[]]) => {
      // Prefer users table; fall back to most recent loan entry
      const latestLoan = Array.isArray(loans) && loans.length > 0 ? loans[0] : null;
      setBank(u.bank || latestLoan?.bank || null);
      setNoRek(u.no_rekening || latestLoan?.no_rekening || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 16px", animation: "fadeInUp 0.4s ease both" }}>
        <Link href="/dashboard/account">
          <button style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }}>
            <ChevronLeft size={18} />
          </button>
        </Link>
        <div>
          <p style={{ fontSize: 18, fontWeight: 800 }}>Akaun Pengeluaran</p>
          <p style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--text-secondary)", textTransform: "uppercase" }}>Withdrawal Account</p>
        </div>
      </div>

      <div style={{ padding: "0 20px", animation: "fadeInUp 0.4s ease 0.1s both" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, padding: "40px 0" }}>Memuatkan...</p>
        ) : (
          <div className="card" style={{ background: "linear-gradient(135deg,#1a1a1a 0%,#0a0a0a 100%)", border: "1px solid var(--border-light)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(5,150,105,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Banknote size={20} color="#059669" />
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-secondary)" }}>Maklumat Bank</p>
            </div>

            {/* Bank Name */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--bg-card)", borderRadius: 12, marginBottom: 10 }}>
              <Building2 size={18} color="var(--text-secondary)" />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>Nama Bank</p>
                <p style={{ fontSize: 15, fontWeight: 700 }}>{bank || "-"}</p>
              </div>
            </div>

            {/* Account Number */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--bg-card)", borderRadius: 12 }}>
              <Banknote size={18} color="var(--text-secondary)" />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>Nombor Akaun</p>
                <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: show ? 0 : 2 }}>
                  {noRek ? (show ? noRek : mask(noRek)) : "-"}
                </p>
              </div>
              {noRek && (
                <button onClick={() => setShow(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4, display: "flex" }}>
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>

            {(!bank && !noRek) && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "16px 0 8px", lineHeight: 1.6 }}>
                Maklumat bank belum dikemaskini.<br />Sila kemaskini semasa membuat permohonan pinjaman.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
