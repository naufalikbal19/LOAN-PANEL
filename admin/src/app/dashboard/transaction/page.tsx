"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Search, Edit2, Trash2, X, User } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL!;

const TX_TYPES = [
  { value: "withdrawal", label: "Pengeluaran",  color: "#ef4444" },
  { value: "credit",     label: "Kredit",       color: "#22c55e" },
  { value: "debit",      label: "Debit",        color: "#f59e0b" },
  { value: "adjustment", label: "Pelarasan",    color: "#6366f1" },
];

function typeColor(t: string) { return TX_TYPES.find((x) => x.value === t)?.color ?? "#888"; }
function typeLabel(t: string) { return TX_TYPES.find((x) => x.value === t)?.label ?? t; }

function badge(type: string) {
  const color = typeColor(type);
  return (
    <span style={{ background: `${color}20`, color, borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>
      {typeLabel(type)}
    </span>
  );
}

interface Tx {
  id: number; user_id: number; name: string; phone: string;
  type: string; amount: number; description: string | null; created_at: string;
}
interface User { id: number; name: string; phone: string; }

const EMPTY_FORM = { user_id: "", type: "credit", amount: "", description: "" };

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editTx, setEditTx] = useState<Tx | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Client search picker
  const [clientSearch, setClientSearch] = useState("");
  const [clientDropdown, setClientDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const clientRef = useRef<HTMLDivElement>(null);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const fetchTx = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`${API}/transactions?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }, [search, token]);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  useEffect(() => {
    fetch(`${API}/users?status=active`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [token]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setErr("");
    setClientSearch("");
    setSelectedClient(null);
    setClientDropdown(false);
    setModal("add");
  };
  const openEdit = (tx: Tx) => {
    setEditTx(tx);
    setForm({ user_id: String(tx.user_id), type: tx.type, amount: String(tx.amount), description: tx.description ?? "" });
    const found = users.find((u) => u.id === tx.user_id) ?? null;
    setSelectedClient(found);
    setClientSearch(found ? `${found.name}` : "");
    setClientDropdown(false);
    setErr("");
    setModal("edit");
  };
  const closeModal = () => {
    setModal(null);
    setEditTx(null);
    setErr("");
    setClientSearch("");
    setSelectedClient(null);
    setClientDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (clientRef.current && !clientRef.current.contains(e.target as Node)) {
        setClientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredClients = clientSearch.trim()
    ? users.filter((u) => {
        const q = clientSearch.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          String(u.id).padStart(4, "0").includes(q) ||
          `#${String(u.id).padStart(4, "0")}`.includes(q)
        );
      }).slice(0, 20)
    : users.slice(0, 20);

  const handleSave = async () => {
    setErr("");
    if (!form.user_id || !form.amount) { setErr("User dan jumlah wajib diisi."); return; }
    setSaving(true);
    try {
      const url = modal === "edit" ? `${API}/transactions/${editTx!.id}` : `${API}/transactions`;
      const method = modal === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: Number(form.user_id), type: form.type, amount: parseFloat(form.amount), description: form.description || null }),
      });
      if (!res.ok) { const d = await res.json(); setErr(d.message || "Gagal menyimpan."); return; }
      closeModal();
      fetchTx();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await fetch(`${API}/transactions/${deleteId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setDeleteId(null);
      fetchTx();
    } catch { setDeleteId(null); }
  };

  const inputStyle: React.CSSProperties = { width: "100%", background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "10px 12px", color: "var(--text-primary)", fontSize: 13, fontFamily: "inherit", outline: "none" };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 6, display: "block" };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Transaksi</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Urus sejarah transaksi setiap klien</p>
        </div>
        <button onClick={openAdd} style={{ background: "#c9a84c", border: "none", borderRadius: 10, padding: "10px 18px", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "inherit" }}>
          <Plus size={16} /> Tambah Transaksi
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 360 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
        <input
          type="text" placeholder="Cari nama, telefon, UID..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 36 }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border-color)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                {["ID","Klien","Jenis","Jumlah","Keterangan","Tarikh","Tindakan"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>Memuatkan...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>Tiada rekod transaksi.</td></tr>
              ) : transactions.map((tx, i) => (
                <tr key={tx.id} style={{ borderBottom: "1px solid var(--border-color)", background: i % 2 === 0 ? "transparent" : "var(--bg-card-inner)" }}>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: 600 }}>#{tx.id}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <p style={{ fontWeight: 700 }}>{tx.name}</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: 11 }}>{tx.phone} · UID #{String(tx.user_id).padStart(4,"0")}</p>
                  </td>
                  <td style={{ padding: "12px 16px" }}>{badge(tx.type)}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 800, color: typeColor(tx.type) }}>
                    {tx.type === "credit" || tx.type === "adjustment" ? "+" : "-"}RM {Number(tx.amount).toLocaleString("ms-MY",{minimumFractionDigits:2})}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)", maxWidth: 200 }}>
                    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.description || "—"}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                    {new Date(tx.created_at).toLocaleDateString("ms-MY")}<br />
                    <span style={{ fontSize: 11 }}>{new Date(tx.created_at).toLocaleTimeString("ms-MY",{hour:"2-digit",minute:"2-digit"})}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEdit(tx)} style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#c9a84c" }}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setDeleteId(tx.id)} style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ef4444" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, width: "100%", maxWidth: 480, padding: 28 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>{modal === "add" ? "Tambah Transaksi" : "Edit Transaksi"}</h2>
              <button onClick={closeModal} style={{ background: "var(--bg-card-inner)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}><X size={16} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Client search picker */}
              <div>
                <label style={labelStyle}>Klien *</label>
                <div ref={clientRef} style={{ position: "relative" }}>
                  {/* Selected badge */}
                  {selectedClient ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-card)", border: "1px solid #c9a84c", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <User size={15} color="#c9a84c" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{selectedClient.name}</p>
                        <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{selectedClient.phone} · #{String(selectedClient.id).padStart(4,"0")}</p>
                      </div>
                      <button onClick={() => { setSelectedClient(null); setForm((p) => ({ ...p, user_id: "" })); setClientSearch(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 2 }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ position: "relative" }}>
                        <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", pointerEvents: "none" }} />
                        <input
                          type="text"
                          placeholder="Cari nama, telefon, atau UID..."
                          value={clientSearch}
                          onChange={(e) => { setClientSearch(e.target.value); setClientDropdown(true); }}
                          onFocus={() => setClientDropdown(true)}
                          style={{ ...inputStyle, paddingLeft: 34 }}
                          autoComplete="off"
                        />
                      </div>
                      {clientDropdown && (
                        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 10, zIndex: 50, maxHeight: 220, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                          {filteredClients.length === 0 ? (
                            <p style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-secondary)", textAlign: "center" }}>Tiada klien ditemui.</p>
                          ) : filteredClients.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => { setSelectedClient(u); setForm((p) => ({ ...p, user_id: String(u.id) })); setClientSearch(u.name); setClientDropdown(false); }}
                              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "none", border: "none", borderBottom: "1px solid var(--border-color)", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--border-color)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                            >
                              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <User size={13} color="#c9a84c" />
                              </div>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</p>
                                <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{u.phone} · #{String(u.id).padStart(4,"0")}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Type */}
              <div>
                <label style={labelStyle}>Jenis Transaksi *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {TX_TYPES.map(({ value, label, color }) => (
                    <button key={value} onClick={() => setForm((p) => ({ ...p, type: value }))}
                      style={{ flex: 1, background: form.type === value ? `${color}22` : "var(--bg-card)", border: `1px solid ${form.type === value ? color : "var(--border-light)"}`, borderRadius: 8, padding: "8px 4px", color: form.type === value ? color : "var(--text-secondary)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label style={labelStyle}>Jumlah (RM) *</label>
                <input type="number" placeholder="0.00" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} style={inputStyle} />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Keterangan</label>
                <input type="text" placeholder="Nota transaksi (pilihan)" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} style={inputStyle} />
              </div>

              {err && <p style={{ color: "#ef4444", fontSize: 13 }}>{err}</p>}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={closeModal} style={{ flex: 1, background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "12px", color: "var(--text-secondary)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
                <button onClick={handleSave} disabled={saving} style={{ flex: 2, background: saving ? "var(--bg-card)" : "#c9a84c", border: "none", borderRadius: 10, padding: "12px", color: saving ? "var(--text-secondary)" : "white", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                  {saving ? "Menyimpan..." : modal === "add" ? "Simpan Transaksi" : "Kemaskini"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, padding: 28, maxWidth: 380, width: "100%", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={24} color="#ef4444" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Padam Transaksi?</p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Tindakan ini tidak boleh dibuat asal. Transaksi #{deleteId} akan dipadam.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "12px", color: "var(--text-secondary)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
              <button onClick={handleDelete} style={{ flex: 1, background: "#ef4444", border: "none", borderRadius: 10, padding: "12px", color: "white", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Padam</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
