"use client";
import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Clock, Eye } from "lucide-react";

interface RepaymentRow {
  id: number;
  loan_id: number;
  user_id: number;
  name: string;
  phone: string;
  loan_amount: number;
  loan_terms: string;
  amount: number;
  installment_no: number;
  due_date: string;
  receipt_url: string | null;
  status: "pending" | "approved" | "rejected";
  note: string | null;
  created_at: string;
}

const API = process.env.NEXT_PUBLIC_API_URL;

async function apiFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("admin_token");
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Ralat.");
  return data;
}

const statusConfig = {
  pending:  { label: "Menunggu",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: Clock },
  approved: { label: "Diluluskan", color: "#22c55e", bg: "rgba(34,197,94,0.12)",   icon: CheckCircle },
  rejected: { label: "Ditolak",    color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: XCircle },
};

export default function AdminRepaymentPage() {
  const [rows, setRows] = useState<RepaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<RepaymentRow | null>(null);
  const [actionStatus, setActionStatus] = useState<"approved" | "rejected">("approved");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (search) params.set("search", search);
    apiFetch<RepaymentRow[]>(`/repayments?${params}`)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleAction = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await apiFetch(`/repayments/${selected.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: actionStatus, note: note || undefined }),
      });
      showToast(`Bayaran balik berjaya ${actionStatus === "approved" ? "diluluskan" : "ditolak"}.`);
      setSelected(null);
      setNote("");
      load();
    } catch (err: any) {
      showToast(err.message || "Gagal.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.phone.includes(q) ||
      String(r.user_id).includes(q) ||
      String(r.loan_id).includes(q)
    );
  });

  const uid = (id: number) => `#${String(id).padStart(4, "0")}`;
  const orderId = (id: number) => `#ORD-${String(id).padStart(5, "0")}`;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--bg-card-inner)",
    border: "1px solid var(--border-color)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "var(--text-primary)",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ padding: "28px 28px 40px" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "12px 18px", zIndex: 9999, fontSize: 13, color: "var(--text-primary)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Repayment</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Semak dan luluskan bukti bayaran balik ahli</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            style={{ ...inputStyle, paddingLeft: 36 }}
            placeholder="Cari nama, telefon, UID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ ...inputStyle, width: "auto", minWidth: 140, cursor: "pointer" }}
        >
          <option value="all">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Diluluskan</option>
          <option value="rejected">Ditolak</option>
        </select>
        <button onClick={load} style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 10, padding: "10px 18px", color: "#c9a84c", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Muat Semula
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                {["UID","Nama / Telefon","Pinjaman","Ansuran","Jumlah","Tarikh Hantar","Status","Resit","Tindakan"].map((h) => (
                  <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: 0.8, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Memuatkan...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Tiada rekod ditemui.</td></tr>
              ) : filtered.map((r) => {
                const cfg = statusConfig[r.status];
                const StatusIcon = cfg.icon;
                return (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{uid(r.user_id)}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{r.name}</p>
                      <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{r.phone}</p>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{orderId(r.loan_id)}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                      Ke-{r.installment_no} <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>/ {parseInt(r.loan_terms) || "—"}</span>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", color: "#c9a84c" }}>
                      RM {Number(r.amount).toLocaleString("ms-MY", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {new Date(r.created_at).toLocaleDateString("ms-MY")}
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, borderRadius: 6, padding: "4px 9px" }}>
                        <StatusIcon size={11} /> {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      {r.receipt_url ? (
                        <button
                          onClick={() => setPreviewImg(r.receipt_url)}
                          style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 7, padding: "6px 10px", color: "#c9a84c", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          <Eye size={12} /> Lihat
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      {r.status === "pending" ? (
                        <button
                          onClick={() => { setSelected(r); setActionStatus("approved"); setNote(""); }}
                          style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 7, padding: "7px 12px", color: "#c9a84c", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          Semak
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 18, padding: 28, width: "100%", maxWidth: 460 }}>
            <p style={{ fontSize: 17, fontWeight: 800, marginBottom: 18 }}>Semak Bayaran Balik</p>

            <div style={{ background: "var(--bg-card-inner)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Ahli",    value: selected.name },
                  { label: "Telefon", value: selected.phone },
                  { label: "Pinjaman",value: orderId(selected.loan_id) },
                  { label: "Ansuran", value: `Ke-${selected.installment_no}` },
                  { label: "Jumlah",  value: `RM ${Number(selected.amount).toLocaleString("ms-MY", { minimumFractionDigits: 2 })}` },
                  { label: "Tarikh",  value: new Date(selected.created_at).toLocaleDateString("ms-MY") },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</p>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{value}</p>
                  </div>
                ))}
              </div>
              {selected.receipt_url && (
                <div style={{ marginTop: 14, borderTop: "1px solid var(--border-color)", paddingTop: 12 }}>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>Resit</p>
                  <img src={selected.receipt_url} alt="receipt" style={{ maxHeight: 180, maxWidth: "100%", objectFit: "contain", borderRadius: 8, border: "1px solid var(--border-color)" }} />
                </div>
              )}
            </div>

            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>Tindakan</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {(["approved", "rejected"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setActionStatus(s)}
                  style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1.5px solid ${actionStatus === s ? (s === "approved" ? "#22c55e" : "#ef4444") : "var(--border-color)"}`, background: actionStatus === s ? (s === "approved" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)") : "transparent", color: actionStatus === s ? (s === "approved" ? "#22c55e" : "#ef4444") : "var(--text-secondary)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  {s === "approved" ? "Luluskan" : "Tolak"}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>Nota (Pilihan)</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Tambah nota untuk ahli..."
              style={{ ...inputStyle, resize: "vertical" }}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setSelected(null)} style={{ flex: 1, background: "transparent", border: "1px solid var(--border-color)", borderRadius: 12, padding: "12px", color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Batal
              </button>
              <button
                onClick={handleAction}
                disabled={submitting}
                style={{ flex: 2, background: actionStatus === "approved" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1.5px solid ${actionStatus === "approved" ? "#22c55e" : "#ef4444"}`, borderRadius: 12, padding: "12px", color: actionStatus === "approved" ? "#22c55e" : "#ef4444", fontSize: 13, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? "Memproses..." : actionStatus === "approved" ? "Sahkan Kelulusan" : "Sahkan Penolakan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview */}
      {previewImg && (
        <div
          onClick={() => setPreviewImg(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "zoom-out" }}
        >
          <img src={previewImg} alt="receipt" style={{ maxHeight: "85vh", maxWidth: "90vw", objectFit: "contain", borderRadius: 12 }} />
        </div>
      )}
    </div>
  );
}
