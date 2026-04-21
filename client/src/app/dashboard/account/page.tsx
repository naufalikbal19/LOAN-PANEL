"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, User, Lock, Banknote, FileText, CalendarClock, History, MessageSquare, LogOut } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import { apiFetch } from "@/lib/api";

const menu = [
  { icon: User,          label: "Personal Information", href: "/dashboard/account/personal-info", color: "#c9a84c" },
  { icon: Lock,          label: "Change Password",      href: "/dashboard/account/change-password", color: "#7c3aed" },
  { icon: Banknote,      label: "Withdrawal Account",   href: "/dashboard/account/withdrawal", color: "#059669" },
  { icon: FileText,      label: "Loan Contract",        href: "#", color: "#f59e0b" },
  { icon: CalendarClock, label: "Repayment",            href: "#", color: "#0891b2" },
  { icon: History,       label: "Transaction History",  href: "/dashboard/account/transaction-history", color: "#6366f1" },
  { icon: MessageSquare, label: "Messages",             href: "#", color: "#ec4899" },
];

function scoreBadge(score: number): { label: string; color: string } {
  if (score >= 580) return { label: "EXCELLENT", color: "#22c55e" };
  if (score >= 450) return { label: "BAIK",      color: "#c9a84c" };
  if (score >= 300) return { label: "SEDERHANA", color: "#f59e0b" };
  return                     { label: "LEMAH",    color: "#ef4444" };
}

function Gauge({ score, max = 600 }: { score: number; max?: number }) {
  const pct = Math.min(score / max, 1);
  const r = 36, circ = Math.PI * r, dash = pct * circ;
  const { color } = scoreBadge(score);
  return (
    <svg width="90" height="54" viewBox="0 0 90 54">
      <path d="M 9 45 A 36 36 0 0 1 81 45" fill="none" stroke="#1e2a50" strokeWidth="8" strokeLinecap="round" />
      <path d="M 9 45 A 36 36 0 0 1 81 45" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} />
      <circle cx="45" cy="45" r="4" fill={color} />
    </svg>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { company_name } = useSettings();
  const [userName, setUserName] = useState("");
  const [creditScore, setCreditScore] = useState<number | null>(null);

  useEffect(() => {
    setUserName(localStorage.getItem("user_name") || "");
    apiFetch("/auth/me")
      .then((u) => setCreditScore(u.credit_score ?? 500))
      .catch(() => setCreditScore(500));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_phone");
    router.push("/sign-in");
  };

  const badge = scoreBadge(creditScore ?? 500);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 16px", animation: "fadeInUp 0.4s ease both" }}>
        <Link href="/dashboard">
          <button style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }}>
            <ChevronLeft size={18} />
          </button>
        </Link>
        <div><p style={{ fontSize: 18, fontWeight: 800 }}>{userName || "MY ACCOUNT"}</p><p style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--text-secondary)", textTransform: "uppercase" }}>{company_name}</p></div>
        <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "var(--accent-blue)", boxShadow: "0 0 8px rgba(201,168,76,0.6)" }} />
      </div>

      <div style={{ padding: "0 20px 20px", animation: "fadeInUp 0.4s ease 0.1s both" }}>
        <div className="card" style={{ background: "linear-gradient(135deg,#1a1a1a 0%,#0a0a0a 100%)", border: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 8 }}>Credit Score</p>
            <p style={{ fontSize: 44, fontWeight: 900, lineHeight: 1, marginBottom: 10, color: creditScore === null ? "var(--text-muted)" : "inherit" }}>
              {creditScore === null ? "..." : creditScore}
            </p>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, background: `${badge.color}22`, color: badge.color, borderRadius: 6, padding: "3px 10px" }}>{badge.label}</span>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>Terakhir dikemaskini hari ini</p>
          </div>
          <div style={{ width: 72, height: 72, background: "var(--bg-card-inner)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-light)" }}>
            <Gauge score={creditScore ?? 500} />
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px 12px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-secondary)" }}>Pengurusan Akaun</p>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10, animation: "fadeInUp 0.4s ease 0.2s both" }}>
        {menu.map(({ icon: Icon, label, href, color }) => (
          <Link key={label} href={href} className="menu-item">
            <div className="menu-item-left">
              <div className="menu-icon-box" style={{ background: `${color}18` }}><Icon size={18} color={color} strokeWidth={2} /></div>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </Link>
        ))}
      </div>

      <div style={{ padding: "20px 20px 8px", animation: "fadeInUp 0.4s ease 0.3s both" }}>
        <button onClick={handleLogout} style={{ width: "100%", background: "transparent", border: "1.5px solid rgba(239,68,68,0.4)", borderRadius: 14, padding: 16, color: "#ef4444", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "inherit", letterSpacing: 1 }}>
          <LogOut size={16} /> LOG KELUAR AKAUN
        </button>
      </div>
    </div>
  );
}
