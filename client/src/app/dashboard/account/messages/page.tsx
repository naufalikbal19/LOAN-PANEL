"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Msg { id: number; title: string; content: string; is_read: number; created_at: string; }

export default function MessagesPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading]   = useState(true);
  const [openId, setOpenId]     = useState<number | null>(null);

  useEffect(() => {
    apiFetch<Msg[]>("/messages/my")
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (msg: Msg) => {
    if (openId === msg.id) { setOpenId(null); return; }
    setOpenId(msg.id);
    if (!msg.is_read) {
      apiFetch(`/messages/my/${msg.id}/read`, { method: "PUT" }).catch(() => {});
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: 1 } : m));
    }
  };

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 16px", animation: "fadeInUp 0.4s ease both" }}>
        <Link href="/dashboard/account">
          <button style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }}>
            <ChevronLeft size={18} />
          </button>
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <p style={{ fontSize: 18, fontWeight: 800 }}>Mesej</p>
            {unread > 0 && (
              <span style={{ background: "#ec4899", color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 50, padding: "2px 7px", lineHeight: 1.6 }}>{unread}</span>
            )}
          </div>
          <p style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--text-secondary)", textTransform: "uppercase" }}>Messages from System</p>
        </div>
      </div>

      <div style={{ padding: "0 20px", animation: "fadeInUp 0.4s ease 0.1s both" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, padding: "60px 0" }}>Memuatkan...</p>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 40, marginBottom: 14 }}>📭</p>
            <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Tiada Mesej</p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Anda belum menerima sebarang mesej.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((msg) => {
              const isOpen = openId === msg.id;
              const unreadDot = !msg.is_read;
              const dateStr = new Date(msg.created_at).toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" });
              const timeStr = new Date(msg.created_at).toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" });
              return (
                <div
                  key={msg.id}
                  className="card"
                  style={{ padding: 0, overflow: "hidden", border: unreadDot ? "1px solid rgba(236,72,153,0.35)" : "1px solid var(--border-color)", cursor: "pointer" }}
                  onClick={() => toggle(msg)}
                >
                  {/* Header row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: unreadDot ? "rgba(236,72,153,0.12)" : "var(--bg-card-inner)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      ✉️
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {unreadDot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ec4899", flexShrink: 0, display: "inline-block" }} />}
                        <p style={{ fontSize: 14, fontWeight: unreadDot ? 800 : 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{msg.title}</p>
                      </div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{dateStr} · {timeStr}</p>
                    </div>
                    <div style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Expandable content */}
                  {isOpen && (
                    <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border-color)" }}>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.75, marginTop: 12, whiteSpace: "pre-wrap" }}>{msg.content}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
