"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Search, Trash2, X, User, Send, Users } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL!;

interface Msg {
  id: number; user_id: number; name: string; phone: string;
  title: string; content: string; is_read: number; created_at: string;
}
interface Member { id: number; name: string; phone: string; }

const EMPTY_FORM = { user_id: "", title: "", content: "", broadcast: false };

export default function MessagesPage() {
  const [messages, setMessages]   = useState<Msg[]>([]);
  const [members, setMembers]     = useState<Member[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [expandId, setExpandId]   = useState<number | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [err, setErr]             = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Client search picker
  const [clientSearch, setClientSearch]     = useState("");
  const [clientDropdown, setClientDropdown] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const clientRef = useRef<HTMLDivElement>(null);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`${API}/messages?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }, [search, token]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  useEffect(() => {
    fetch(`${API}/users?status=active`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setMembers(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [token]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (clientRef.current && !clientRef.current.contains(e.target as Node)) setClientDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredMembers = clientSearch.trim()
    ? members.filter((u) => {
        const q = clientSearch.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.phone.includes(q) ||
          `#${String(u.id).padStart(4,"0")}`.includes(q);
      }).slice(0, 20)
    : members.slice(0, 20);

  const openModal = () => {
    setForm(EMPTY_FORM); setErr(""); setSuccessMsg("");
    setClientSearch(""); setSelectedMember(null); setClientDropdown(false);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false); setErr(""); setSuccessMsg("");
    setClientSearch(""); setSelectedMember(null); setClientDropdown(false);
  };

  const handleSave = async () => {
    setErr(""); setSuccessMsg("");
    if (!form.title.trim() || !form.content.trim()) { setErr("Tajuk dan kandungan mesej wajib diisi."); return; }
    if (!form.broadcast && !form.user_id) { setErr("Pilih ahli atau aktifkan Broadcast."); return; }
    setSaving(true);
    try {
      const body: any = { title: form.title, content: form.content };
      if (form.broadcast) body.broadcast = true;
      else body.user_id = Number(form.user_id);
      const res = await fetch(`${API}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.message || "Gagal menghantar."); return; }
      setSuccessMsg(data.message);
      fetchMessages();
      setTimeout(closeModal, 1800);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await fetch(`${API}/messages/${deleteId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setDeleteId(null); fetchMessages();
    } catch { setDeleteId(null); }
  };

  const inputStyle: React.CSSProperties = { width: "100%", background: "#1a1a1a", border: "1px solid #2e2e2e", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#888", marginBottom: 6, display: "block" };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Mesej</h1>
          <p style={{ color: "#888", fontSize: 13 }}>Hantar & urus mesej kepada ahli</p>
        </div>
        <button onClick={openModal} style={{ background: "#c9a84c", border: "none", borderRadius: 10, padding: "10px 18px", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "inherit" }}>
          <Plus size={16} /> Hantar Mesej
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 360 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#666" }} />
        <input type="text" placeholder="Cari nama, telefon..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 36 }} />
      </div>

      {/* Table */}
      <div style={{ background: "#111", borderRadius: 14, border: "1px solid #1e1e1e", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e1e1e" }}>
                {["ID","Ahli","Tajuk","Kandungan","Status","Tarikh","Tindakan"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#666", fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#666" }}>Memuatkan...</td></tr>
              ) : messages.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#666" }}>Tiada rekod mesej.</td></tr>
              ) : messages.map((msg, i) => (
                <React.Fragment key={msg.id}>
                  <tr
                    style={{ borderBottom: expandId === msg.id ? "none" : "1px solid #1a1a1a", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)", cursor: "pointer" }}
                    onClick={() => setExpandId(expandId === msg.id ? null : msg.id)}
                  >
                    <td style={{ padding: "12px 16px", color: "#888", fontWeight: 600 }}>#{msg.id}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ fontWeight: 700 }}>{msg.name}</p>
                      <p style={{ color: "#888", fontSize: 11 }}>{msg.phone} · #{String(msg.user_id).padStart(4,"0")}</p>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: msg.is_read ? 500 : 700, maxWidth: 180 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {!msg.is_read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ec4899", flexShrink: 0 }} />}
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#888", maxWidth: 200 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.content}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: msg.is_read ? "rgba(34,197,94,0.12)" : "rgba(236,72,153,0.12)", color: msg.is_read ? "#22c55e" : "#ec4899", borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                        {msg.is_read ? "Dibaca" : "Belum Dibaca"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#888", whiteSpace: "nowrap", fontSize: 12 }}>
                      {new Date(msg.created_at).toLocaleDateString("ms-MY")}<br />
                      <span style={{ fontSize: 11 }}>{new Date(msg.created_at).toLocaleTimeString("ms-MY",{hour:"2-digit",minute:"2-digit"})}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(msg.id); }}
                        style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ef4444" }}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                  {expandId === msg.id && (
                    <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                      <td colSpan={7} style={{ padding: "0 16px 16px" }}>
                        <div style={{ background: "#0e0e0e", borderRadius: 10, padding: "14px 16px", border: "1px solid #1e1e1e" }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: "#c9a84c", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Kandungan Penuh</p>
                          <p style={{ fontSize: 13, color: "#ccc", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{msg.content}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#111", border: "1px solid #2e2e2e", borderRadius: 16, width: "100%", maxWidth: 520, padding: 28 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Hantar Mesej</h2>
              <button onClick={closeModal} style={{ background: "#1e1e1e", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#888" }}><X size={16} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Broadcast toggle */}
              <div>
                <label style={labelStyle}>Jenis Penerima</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setForm((p) => ({ ...p, broadcast: false, user_id: "" })); setSelectedMember(null); setClientSearch(""); }}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: !form.broadcast ? "rgba(201,168,76,0.15)" : "#1a1a1a", border: `1px solid ${!form.broadcast ? "#c9a84c" : "#2e2e2e"}`, borderRadius: 8, padding: "9px 12px", color: !form.broadcast ? "#c9a84c" : "#666", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    <User size={13} /> Ahli Tertentu
                  </button>
                  <button onClick={() => { setForm((p) => ({ ...p, broadcast: true, user_id: "" })); setSelectedMember(null); setClientSearch(""); }}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: form.broadcast ? "rgba(201,168,76,0.15)" : "#1a1a1a", border: `1px solid ${form.broadcast ? "#c9a84c" : "#2e2e2e"}`, borderRadius: 8, padding: "9px 12px", color: form.broadcast ? "#c9a84c" : "#666", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    <Users size={13} /> Semua Ahli
                  </button>
                </div>
              </div>

              {/* Client search picker (only if not broadcast) */}
              {!form.broadcast && (
                <div>
                  <label style={labelStyle}>Pilih Ahli *</label>
                  <div ref={clientRef} style={{ position: "relative" }}>
                    {selectedMember ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#1a1a1a", border: "1px solid #c9a84c", borderRadius: 8, padding: "10px 12px" }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <User size={13} color="#c9a84c" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{selectedMember.name}</p>
                          <p style={{ fontSize: 11, color: "#888" }}>{selectedMember.phone} · #{String(selectedMember.id).padStart(4,"0")}</p>
                        </div>
                        <button onClick={() => { setSelectedMember(null); setForm((p) => ({ ...p, user_id: "" })); setClientSearch(""); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#666", padding: 2 }}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{ position: "relative" }}>
                          <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#666", pointerEvents: "none" }} />
                          <input type="text" placeholder="Cari nama, telefon, atau UID..." value={clientSearch}
                            onChange={(e) => { setClientSearch(e.target.value); setClientDropdown(true); }}
                            onFocus={() => setClientDropdown(true)}
                            style={{ ...inputStyle, paddingLeft: 34 }} autoComplete="off" />
                        </div>
                        {clientDropdown && (
                          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#1a1a1a", border: "1px solid #2e2e2e", borderRadius: 10, zIndex: 50, maxHeight: 200, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                            {filteredMembers.length === 0 ? (
                              <p style={{ padding: "14px 16px", fontSize: 13, color: "#666", textAlign: "center" }}>Tiada ahli ditemui.</p>
                            ) : filteredMembers.map((u) => (
                              <button key={u.id}
                                onClick={() => { setSelectedMember(u); setForm((p) => ({ ...p, user_id: String(u.id) })); setClientSearch(u.name); setClientDropdown(false); }}
                                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "none", border: "none", borderBottom: "1px solid #222", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#242424")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                              >
                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <User size={13} color="#c9a84c" />
                                </div>
                                <div>
                                  <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{u.name}</p>
                                  <p style={{ fontSize: 11, color: "#888" }}>{u.phone} · #{String(u.id).padStart(4,"0")}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {form.broadcast && (
                <div style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8, padding: "10px 14px" }}>
                  <p style={{ fontSize: 12, color: "#c9a84c", fontWeight: 600 }}>📢 Mesej akan dihantar kepada <strong>semua ahli aktif</strong>.</p>
                </div>
              )}

              {/* Title */}
              <div>
                <label style={labelStyle}>Tajuk Mesej *</label>
                <input type="text" placeholder="cth: Notifikasi Status Pinjaman" value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} style={inputStyle} />
              </div>

              {/* Content */}
              <div>
                <label style={labelStyle}>Kandungan *</label>
                <textarea rows={5} placeholder="Tulis mesej anda di sini..." value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
              </div>

              {err && <p style={{ color: "#ef4444", fontSize: 13 }}>{err}</p>}
              {successMsg && <p style={{ color: "#22c55e", fontSize: 13 }}>✓ {successMsg}</p>}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={closeModal} style={{ flex: 1, background: "#1a1a1a", border: "1px solid #2e2e2e", borderRadius: 10, padding: "12px", color: "#888", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
                <button onClick={handleSave} disabled={saving}
                  style={{ flex: 2, background: saving ? "#1a1a1a" : "#c9a84c", border: "none", borderRadius: 10, padding: "12px", color: saving ? "#666" : "white", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                  <Send size={15} /> {saving ? "Menghantar..." : "Hantar Mesej"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#111", border: "1px solid #2e2e2e", borderRadius: 16, padding: 28, maxWidth: 380, width: "100%", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={24} color="#ef4444" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Padam Mesej?</p>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>Mesej #{deleteId} akan dipadam dan tidak boleh dipulihkan.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, background: "#1a1a1a", border: "1px solid #2e2e2e", borderRadius: 10, padding: "12px", color: "#888", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
              <button onClick={handleDelete} style={{ flex: 1, background: "#ef4444", border: "none", borderRadius: 10, padding: "12px", color: "white", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Padam</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
