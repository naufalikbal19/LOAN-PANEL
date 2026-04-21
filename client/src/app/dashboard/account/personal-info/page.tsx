"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, Eye, EyeOff, User, Phone, CreditCard, MapPin, AlertCircle, ImageIcon } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

function formatDate(raw: string | null): string {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

function mask(val: string | null): string {
  if (!val) return "-";
  if (val.length <= 4) return "••••";
  return val.slice(0, 2) + "•".repeat(val.length - 4) + val.slice(-2);
}

function Row({ label, value, sensitive }: { label: string; value: string | null; sensitive?: boolean }) {
  const [show, setShow] = useState(false);
  const display = value || "-";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border-color)" }}>
      <span style={{ fontSize: 13, color: "var(--text-secondary)", flex: 1 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", textAlign: "right", maxWidth: 180, wordBreak: "break-all" }}>
          {sensitive ? (show ? display : mask(display === "-" ? null : display)) : display}
        </span>
        {sensitive && value && (
          <button onClick={() => setShow(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2, display: "flex" }}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, color, children }: { title: string; icon: React.ElementType; color: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={14} color={color} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-secondary)" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function DocCard({ label, url }: { label: string; url: string | null }) {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  if (!url) return (
    <div style={{ background: "var(--bg-card-inner)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border-color)" }}>
      <div style={{ height: 110, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <ImageIcon size={24} color="var(--text-muted)" />
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Tiada gambar</span>
      </div>
      <div style={{ padding: "8px 10px", background: "var(--bg-card)" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>{label}</p>
      </div>
    </div>
  );
  const src = url.startsWith("http") ? url : `${API}${url}`;
  return (
    <div style={{ background: "var(--bg-card-inner)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border-color)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
      <div style={{ padding: "8px 10px", background: "var(--bg-card)" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>{label}</p>
      </div>
    </div>
  );
}

export default function PersonalInfoPage() {
  const [user, setUser]   = useState<any>(null);
  const [loan, setLoan]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/auth/me"),
      apiFetch("/loans/my").catch(() => []),
    ]).then(([u, loans]) => {
      setUser(u);
      if (Array.isArray(loans) && loans.length > 0) setLoan(loans[0]);
    }).finally(() => setLoading(false));
  }, []);

  const genderLabel = (g: string | null) => ({ male: "Lelaki", female: "Perempuan", other: "Lain-lain" }[g ?? ""] ?? "-");

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 16px", animation: "fadeInUp 0.4s ease both" }}>
        <Link href="/dashboard/account">
          <button style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }}>
            <ChevronLeft size={18} />
          </button>
        </Link>
        <div>
          <p style={{ fontSize: 18, fontWeight: 800 }}>Maklumat Pribadi</p>
          <p style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--text-secondary)", textTransform: "uppercase" }}>Personal Information</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Memuatkan...</div>
      ) : (
        <div style={{ padding: "0 20px", animation: "fadeInUp 0.4s ease 0.1s both" }}>

          {/* Identity */}
          <Section title="Maklumat Asas" icon={User} color="#c9a84c">
            <Row label="Nama Penuh"   value={user?.name} />
            <Row label="No. Telefon"  value={user?.phone} />
            <Row label="No. Kad Pengenalan" value={user?.ic} sensitive />
            <Row label="Jantina"      value={genderLabel(user?.gender)} />
            <Row label="Tarikh Lahir" value={formatDate(user?.birthday)} />
          </Section>

          {/* Employment */}
          <Section title="Pekerjaan & Kewangan" icon={CreditCard} color="#6366f1">
            <Row label="Pekerjaan Semasa"    value={user?.occupation} />
            <Row label="Pendapatan Bulanan"  value={user?.monthly_income ? `RM ${Number(user.monthly_income).toLocaleString("ms-MY")}` : null} />
            <Row label="Tujuan Pinjaman"     value={user?.loan_purpose} />
          </Section>

          {/* Address */}
          <Section title="Alamat" icon={MapPin} color="#059669">
            <Row label="Alamat Semasa" value={user?.current_address} />
          </Section>

          {/* Emergency */}
          {(loan?.emergency_name || loan?.emergency_phone) && (
            <Section title="Kenalan Kecemasan" icon={Phone} color="#f59e0b">
              <Row label="Nama Kenalan"   value={loan?.emergency_name} />
              <Row label="No. Telefon"    value={loan?.emergency_phone} />
            </Section>
          )}

          {/* Documents */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertCircle size={14} color="#ef4444" />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-secondary)" }}>Dokumen</span>
            </div>
            {!loan ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>Tiada rekod pinjaman ditemui.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <DocCard label="Hadapan IC"  url={loan?.front_ic_url} />
                <DocCard label="Belakang IC" url={loan?.back_ic_url} />
                <div style={{ gridColumn: "1 / -1" }}>
                  <DocCard label="Selfie" url={loan?.selfie_url} />
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
