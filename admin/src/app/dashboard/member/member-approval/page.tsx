"use client";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Eye, X, RefreshCw } from "lucide-react";

interface Member {
  id: number;
  name: string;
  ic: string;
  phone: string;
  status: "pending" | "active" | "rejected";
  created_at: string;
}

export default function MemberApprovalPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMember, setViewMember] = useState<Member | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?status=pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (id: number, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}/${action}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || "Ralat.", "error"); return; }
      showToast(data.message, "success");
      setMembers((prev) => prev.filter((m) => m.id !== id));
      if (viewMember?.id === id) setViewMember(null);
    } catch {
      showToast("Ralat sambungan.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200, background: toast.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 10, padding: "12px 18px", color: toast.type === "success" ? "#22c55e" : "#ef4444", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          {toast.type === "success" ? <CheckCircle size={15} /> : <XCircle size={15} />}
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Member Approval</h1>
          <p style={{ color: "#888", fontSize: 13 }}>Semak dan luluskan permohonan pendaftaran baharu</p>
        </div>
        <button onClick={fetchPending} style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: 8, padding: "8px 14px", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "inherit" }}>
          <RefreshCw size={13} /> Muat Semula
        </button>
      </div>

      {/* Counter badge */}
      {!loading && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 10, padding: "8px 14px", marginBottom: 20 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#c9a84c", display: "inline-block" }} />
          <span style={{ fontSize: 13, color: "#c9a84c", fontWeight: 700 }}>{members.length} permohonan menunggu kelulusan</span>
        </div>
      )}

      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e1e1e" }}>
                {["UID", "Nama", "No. IC", "Telefon", "Tarikh Daftar", "Tindakan"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#555", fontSize: 13 }}>Memuatkan...</td></tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 48, color: "#555" }}>
                    <CheckCircle size={32} color="#22c55e" style={{ marginBottom: 10, opacity: 0.5 }} />
                    <p style={{ fontSize: 13 }}>Tiada permohonan menunggu kelulusan.</p>
                  </td>
                </tr>
              ) : members.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid #1a1a1a" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#161616")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "14px 16px", color: "#c9a84c", fontWeight: 700, fontFamily: "monospace", fontSize: 13 }}>#{String(m.id).padStart(4, "0")}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#fff", fontWeight: 600 }}>{m.name}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#aaa", fontFamily: "monospace" }}>{m.ic}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#aaa" }}>{m.phone}</td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "#666", whiteSpace: "nowrap" }}>{new Date(m.created_at).toLocaleString("ms-MY")}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setViewMember(m)} title="Lihat detail" style={{ background: "rgba(201,168,76,0.1)", border: "none", borderRadius: 7, padding: "6px 8px", cursor: "pointer", color: "#c9a84c", display: "flex" }}>
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleAction(m.id, "approve")}
                        disabled={actionLoading === m.id}
                        title="Luluskan"
                        style={{ background: "rgba(34,197,94,0.1)", border: "none", borderRadius: 7, padding: "6px 12px", cursor: "pointer", color: "#22c55e", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, fontFamily: "inherit", opacity: actionLoading === m.id ? 0.6 : 1 }}
                      >
                        <CheckCircle size={13} /> Lulus
                      </button>
                      <button
                        onClick={() => handleAction(m.id, "reject")}
                        disabled={actionLoading === m.id}
                        title="Tolak"
                        style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 7, padding: "6px 12px", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, fontFamily: "inherit", opacity: actionLoading === m.id ? 0.6 : 1 }}
                      >
                        <XCircle size={13} /> Tolak
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewMember && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "#111", border: "1px solid #2e2e2e", borderRadius: 16, padding: 28, width: "100%", maxWidth: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>Detail Permohonan</h2>
              <button onClick={() => setViewMember(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#666", display: "flex" }}><X size={18} /></button>
            </div>
            {[
              ["UID", `#${String(viewMember.id).padStart(4, "0")}`],
              ["Nama Penuh", viewMember.name],
              ["No. Kad Pengenalan", viewMember.ic],
              ["Nombor Telefon", viewMember.phone],
              ["Tarikh Daftar", new Date(viewMember.created_at).toLocaleString("ms-MY")],
            ].map(([label, val]) => (
              <div key={label} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #1e1e1e" }}>
                <p style={{ fontSize: 11, color: "#555", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 14, color: "#fff" }}>{val}</p>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                onClick={() => handleAction(viewMember.id, "approve")}
                disabled={actionLoading === viewMember.id}
                style={{ flex: 1, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#22c55e", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: actionLoading === viewMember.id ? 0.6 : 1 }}
              >
                <CheckCircle size={15} /> Luluskan
              </button>
              <button
                onClick={() => handleAction(viewMember.id, "reject")}
                disabled={actionLoading === viewMember.id}
                style={{ flex: 1, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#ef4444", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: actionLoading === viewMember.id ? 0.6 : 1 }}
              >
                <XCircle size={15} /> Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
