"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, X, Save, ChevronDown, Eye, EyeOff } from "lucide-react";

interface Admin {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff";
  is_active: number;
  created_at: string;
}

const ROLE_BADGE = {
  admin: { bg: "rgba(201,168,76,0.12)", color: "#c9a84c", label: "Admin" },
  staff: { bg: "rgba(99,102,241,0.12)", color: "#818cf8", label: "Staff" },
};

const STATUS_BADGE = {
  active:   { bg: "rgba(34,197,94,0.1)",  color: "#22c55e", label: "Aktif" },
  inactive: { bg: "rgba(239,68,68,0.1)",  color: "#ef4444", label: "Tidak Aktif" },
};

interface AddForm  { name: string; email: string; password: string; role: string; }
interface EditForm { name: string; email: string; role: string; is_active: string; password: string; }

const emptyAdd: AddForm  = { name: "", email: "", password: "", role: "staff" };
const emptyEdit: EditForm = { name: "", email: "", role: "staff", is_active: "1", password: "" };

export default function AdminListPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [inputSearch, setInputSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<AddForm>(emptyAdd);
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [showAddPass, setShowAddPass] = useState(false);

  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(emptyEdit);
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [showEditPass, setShowEditPass] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [myId] = useState(() => {
    if (typeof window === "undefined") return 0;
    try {
      const token = localStorage.getItem("admin_token") || "";
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id as number;
    } catch { return 0; }
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";
  const adminRole = typeof window !== "undefined" ? localStorage.getItem("admin_role") : "";

  const fetchAdmins = async (q = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("search", q);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAdmins(Array.isArray(data) ? data : []);
    } catch {
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchAdmins(inputSearch); };

  const handleAdd = async () => {
    setAddLoading(true); setAddError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.message || "Ralat."); return; }
      setShowAdd(false);
      setAddForm(emptyAdd);
      fetchAdmins(search);
    } catch {
      setAddError("Ralat sambungan.");
    } finally {
      setAddLoading(false);
    }
  };

  const openEdit = (a: Admin) => {
    setEditAdmin(a);
    setEditForm({ name: a.name, email: a.email, role: a.role, is_active: String(a.is_active), password: "" });
    setEditError("");
    setShowEditPass(false);
  };

  const handleEdit = async () => {
    if (!editAdmin) return;
    setEditLoading(true); setEditError("");
    try {
      const body: Record<string, any> = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        is_active: Number(editForm.is_active),
      };
      if (editForm.password) body.password = editForm.password;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/${editAdmin.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.message || "Ralat."); return; }
      setEditAdmin(null);
      fetchAdmins(search);
    } catch {
      setEditError("Ralat sambungan.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteId(null);
      fetchAdmins(search);
    } catch {
      setDeleteId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const select = (style?: React.CSSProperties) => ({
    style: { background: "var(--bg-card-inner)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "10px 32px 10px 12px", color: "var(--text-primary)", fontSize: 13, width: "100%", outline: "none", fontFamily: "inherit", appearance: "none" as const, ...style },
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Admin List</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Urus akaun pentadbir dan kakitangan</p>
        </div>
        {adminRole === "admin" && (
          <button onClick={() => { setShowAdd(true); setAddError(""); setAddForm(emptyAdd); }} style={{ display: "flex", alignItems: "center", gap: 8, background: "#c9a84c", color: "#000", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            <Plus size={16} /> Tambah Admin
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 20, maxWidth: 400 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input value={inputSearch} onChange={(e) => setInputSearch(e.target.value)} placeholder="Cari nama atau e-mel..." style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "9px 12px 9px 32px", color: "var(--text-primary)", fontSize: 13, width: "100%", outline: "none", fontFamily: "inherit" }} />
        </div>
        <button type="submit" style={{ background: "#c9a84c", color: "#000", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cari</button>
      </form>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--nav-bg)" }}>
                {["#", "Nama", "E-mel", "Peranan", "Status", "Tarikh Daftar", "Tindakan"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Memuatkan...</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Tiada rekod dijumpai.</td></tr>
              ) : admins.map((a, i) => {
                const rb = ROLE_BADGE[a.role] ?? ROLE_BADGE.staff;
                const sb = a.is_active ? STATUS_BADGE.active : STATUS_BADGE.inactive;
                const isSelf = a.id === myId;
                return (
                  <tr key={a.id} style={{ borderTop: "1px solid var(--border-color)", background: i % 2 === 0 ? "transparent" : "var(--bg-card-inner)" }}>
                    <td style={{ padding: "13px 16px", color: "var(--text-muted)", fontSize: 11 }}>{a.id}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, background: "rgba(201,168,76,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#c9a84c", flexShrink: 0 }}>
                          {a.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{a.name}{isSelf && <span style={{ marginLeft: 6, fontSize: 10, color: "#c9a84c", fontWeight: 700 }}>(Anda)</span>}</span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px", color: "var(--text-secondary)" }}>{a.email}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ background: rb.bg, color: rb.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{rb.label}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ background: sb.bg, color: sb.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{sb.label}</span>
                    </td>
                    <td style={{ padding: "13px 16px", color: "var(--text-secondary)", whiteSpace: "nowrap", fontSize: 12 }}>{new Date(a.created_at).toLocaleDateString("ms-MY")}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(a)} style={{ padding: "5px 10px", background: "rgba(201,168,76,0.1)", border: "none", borderRadius: 7, color: "#c9a84c", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontFamily: "inherit" }}>
                          <Pencil size={12} /> Edit
                        </button>
                        {adminRole === "admin" && !isSelf && (
                          <button onClick={() => setDeleteId(a.id)} style={{ padding: "5px 10px", background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 7, color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontFamily: "inherit" }}>
                            <Trash2 size={12} /> Padam
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>Tambah Admin / Staff</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}><X size={18} /></button>
            </div>
            {addError && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{addError}</p>}
            {(["name", "email"] as const).map((key) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>{key === "name" ? "Nama" : "E-mel"}</label>
                <input value={addForm[key]} onChange={(e) => setAddForm((p) => ({ ...p, [key]: e.target.value }))} type={key === "email" ? "email" : "text"} style={{ background: "var(--bg-card-inner)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "10px 12px", color: "var(--text-primary)", fontSize: 13, width: "100%", outline: "none", fontFamily: "inherit" }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>Kata Laluan</label>
              <div style={{ position: "relative" }}>
                <input value={addForm.password} onChange={(e) => setAddForm((p) => ({ ...p, password: e.target.value }))} type={showAddPass ? "text" : "password"} placeholder="Min. 6 aksara" style={{ background: "var(--bg-card-inner)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "10px 40px 10px 12px", color: "var(--text-primary)", fontSize: 13, width: "100%", outline: "none", fontFamily: "inherit" }} />
                <button onClick={() => setShowAddPass(!showAddPass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>{showAddPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>Peranan</label>
              <div style={{ position: "relative" }}>
                <select value={addForm.role} onChange={(e) => setAddForm((p) => ({ ...p, role: e.target.value }))}{...select()}>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", pointerEvents: "none" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAdd(false)} style={{ background: "var(--bg-card-inner)", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
              <button onClick={handleAdd} disabled={addLoading} style={{ background: "#c9a84c", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, opacity: addLoading ? 0.7 : 1 }}>
                <Plus size={14} /> {addLoading ? "Mencipta..." : "Cipta Akaun"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editAdmin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>Edit Admin / Staff</h2>
              <button onClick={() => setEditAdmin(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}><X size={18} /></button>
            </div>
            {editError && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{editError}</p>}
            {(["name", "email"] as const).map((key) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>{key === "name" ? "Nama" : "E-mel"}</label>
                <input value={editForm[key]} onChange={(e) => setEditForm((p) => ({ ...p, [key]: e.target.value }))} type={key === "email" ? "email" : "text"} style={{ background: "var(--bg-card-inner)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "10px 12px", color: "var(--text-primary)", fontSize: 13, width: "100%", outline: "none", fontFamily: "inherit" }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>Kata Laluan Baru (kosongkan jika tidak tukar)</label>
              <div style={{ position: "relative" }}>
                <input value={editForm.password} onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))} type={showEditPass ? "text" : "password"} placeholder="Min. 6 aksara" style={{ background: "var(--bg-card-inner)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "10px 40px 10px 12px", color: "var(--text-primary)", fontSize: 13, width: "100%", outline: "none", fontFamily: "inherit" }} />
                <button onClick={() => setShowEditPass(!showEditPass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>{showEditPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>Peranan</label>
                <div style={{ position: "relative" }}>
                  <select value={editForm.role} onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}{...select()}>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                  <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", pointerEvents: "none" }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>Status</label>
                <div style={{ position: "relative" }}>
                  <select value={editForm.is_active} onChange={(e) => setEditForm((p) => ({ ...p, is_active: e.target.value }))}{...select()}>
                    <option value="1">Aktif</option>
                    <option value="0">Tidak Aktif</option>
                  </select>
                  <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", pointerEvents: "none" }} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setEditAdmin(null)} style={{ background: "var(--bg-card-inner)", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
              <button onClick={handleEdit} disabled={editLoading} style={{ background: "#c9a84c", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, opacity: editLoading ? 0.7 : 1 }}>
                <Save size={14} /> {editLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 340, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, background: "rgba(239,68,68,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={22} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Padam Akaun?</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24 }}>Tindakan ini tidak boleh dibatalkan.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setDeleteId(null)} style={{ background: "var(--bg-card-inner)", border: "none", borderRadius: 8, padding: "9px 22px", fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
              <button onClick={handleDelete} disabled={deleteLoading} style={{ background: "#ef4444", border: "none", borderRadius: 8, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#fff", fontFamily: "inherit", opacity: deleteLoading ? 0.7 : 1 }}>
                {deleteLoading ? "Memadamkan..." : "Ya, Padam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
