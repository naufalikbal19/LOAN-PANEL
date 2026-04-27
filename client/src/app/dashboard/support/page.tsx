"use client";
import { Phone, MessageCircle, Mail, Clock, ChevronRight } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

const faq = [
  { q: "Bagaimana untuk memohon pinjaman?",     a: "Klik butang Apply Now di laman utama dan ikuti langkah yang diberikan." },
  { q: "Berapa lama proses kelulusan?",          a: "Proses kelulusan mengambil masa 1-3 hari bekerja." },
  { q: "Apakah dokumen yang diperlukan?",        a: "IC, slip gaji 3 bulan terkini, dan penyata bank 3 bulan terkini." },
  { q: "Bagaimana untuk membuat bayaran balik?", a: "Anda boleh membuat bayaran melalui dompet anda atau kaedah pembayaran yang tersedia." },
];

export default function SupportPage() {
  const { support_phone, support_whatsapp } = useSettings();

  const contacts = [
    { icon: Phone,         label: "Telefon",  value: support_phone || "—",    color: "#22c55e", action: "Hubungi",  href: support_phone ? `tel:${support_phone}` : undefined },
    { icon: MessageCircle, label: "WhatsApp", value: support_whatsapp || "—", color: "#22c55e", action: "WhatsApp", href: support_whatsapp ? `https://wa.me/${support_whatsapp.replace(/\D/g, "")}` : undefined },
    { icon: Mail,          label: "E-mel",    value: "support@easyloans.my", color: "#c9a84c", action: "E-mel", href: "mailto:support@easyloans.my" },
  ];

  return (
    <div>
      <div style={{ padding: "20px 20px 16px", animation: "fadeInUp 0.4s ease both" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--accent-blue)", marginBottom: 4 }}>Perkhidmat Pelanggan</p>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Boleh kami <span style={{ color: "var(--accent-blue-light)" }}>bantu?</span></h1>
      </div>
      <div style={{ padding: "0 20px 20px", animation: "fadeInUp 0.4s ease 0.1s both" }}>
        <div className="card" style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.18)" }}>
          <Clock size={18} color="var(--accent-blue-light)" />
          <div><p style={{ fontSize: 13, fontWeight: 600 }}>Waktu Operasi</p><p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Isnin - Jumaat: 9:00 AM - 6:00 PM</p><p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Sabtu: 9:00 AM - 1:00 PM</p></div>
        </div>
      </div>
      <div style={{ padding: "0 20px 20px", animation: "fadeInUp 0.4s ease 0.2s both" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 12 }}>Hubungi Kami</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {contacts.map(({ icon: Icon, label, value, color, action, href }) => (
            <div key={label} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={18} color={color} /></div>
                <div><p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 2 }}>{label}</p><p style={{ fontSize: 14, fontWeight: 600 }}>{value}</p></div>
              </div>
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  <button style={{ background: "var(--accent-blue)", border: "none", borderRadius: 10, padding: "8px 14px", color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{action}</button>
                </a>
              ) : (
                <button disabled style={{ background: "var(--bg-card-inner)", border: "none", borderRadius: 10, padding: "8px 14px", color: "var(--text-muted)", fontSize: 11, fontWeight: 700, cursor: "not-allowed", fontFamily: "inherit" }}>{action}</button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 20px", animation: "fadeInUp 0.4s ease 0.3s both" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 12 }}>Soalan Lazim</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {faq.map(({ q, a }) => (
            <details key={q} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
              <summary style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between", listStyle: "none", userSelect: "none" }}>
                {q}<ChevronRight size={16} color="var(--text-muted)" />
              </summary>
              <div style={{ padding: "0 16px 14px", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
