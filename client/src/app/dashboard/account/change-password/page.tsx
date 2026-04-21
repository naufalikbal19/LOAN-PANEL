"use client";
import { ChevronLeft, HeadphonesIcon, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";

export default function ChangePasswordPage() {
  const { support_whatsapp, support_phone } = useSettings();

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 16px", animation: "fadeInUp 0.4s ease both" }}>
        <Link href="/dashboard/account">
          <button style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }}>
            <ChevronLeft size={18} />
          </button>
        </Link>
        <div>
          <p style={{ fontSize: 18, fontWeight: 800 }}>Tukar Kata Laluan</p>
          <p style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--text-secondary)", textTransform: "uppercase" }}>Change Password</p>
        </div>
      </div>

      <div style={{ padding: "40px 20px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, animation: "fadeInUp 0.4s ease 0.1s both" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <HeadphonesIcon size={36} color="#7c3aed" />
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 17, fontWeight: 800, marginBottom: 10 }}>Hubungi Khidmat Pelanggan</p>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8 }}>
            Sila hubungi pegawai perkhidmatan untuk reset kata laluan Anda !
          </p>
        </div>

        <div className="card" style={{ width: "100%", background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)" }}>
          {support_whatsapp && (
            <a href={`https://wa.me/${support_whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: support_phone ? "1px solid var(--border-color)" : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <MessageSquare size={16} color="#22c55e" />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 2 }}>WhatsApp</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{support_whatsapp}</p>
                </div>
              </div>
            </a>
          )}
          {support_phone && (
            <a href={`tel:${support_phone}`} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(201,168,76,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <HeadphonesIcon size={16} color="#c9a84c" />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 2 }}>Telefon</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{support_phone}</p>
                </div>
              </div>
            </a>
          )}
          {!support_whatsapp && !support_phone && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>Sila rujuk laman Sokongan untuk maklumat hubungan.</p>
          )}
        </div>
      </div>
    </div>
  );
}
