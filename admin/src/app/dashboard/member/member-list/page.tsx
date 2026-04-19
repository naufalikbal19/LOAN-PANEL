"use client";
import { useEffect, useState } from "react";
import { Search, RefreshCw, ChevronDown, X, Save } from "lucide-react";

interface LoanRow {
  id: number;
  user_id: number;
  phone: string;
  amount: string;
  status: LoanStatus;
  created_at: string;
}

type LoanStatus =
  | "under_review"
  | "loan_approved"
  | "credit_frozen"
  | "unfrozen_processing"
  | "credit_score_low"
  | "payment_processing"
  | "loan_being_canceled";

const STATUS_META: Record<LoanStatus, { label: string; bg: string; color: string }> = {
  under_review:        { label: "Under Review",        bg: "rgba(201,168,76,0.12)", color: "#c9a84c" },
  loan_approved:       { label: "Loan Approved",        bg: "rgba(34,197,94,0.1)",  color: "#22c55e" },
  credit_frozen:       { label: "Credit Frozen",        bg: "rgba(239,68,68,0.1)",  color: "#ef4444" },
  unfrozen_processing: { label: "Unfrozen Processing",  bg: "rgba(251,146,60,0.1)", color: "#fb923c" },
  credit_score_low:    { label: "Credit Score Low",     bg: "rgba(239,68,68,0.08)", color: "#f87171" },
  payment_processing:  { label: "Payment Processing",   bg: "rgba(99,102,241,0.1)", color: "#818cf8" },
  loan_being_canceled: { label: "Loan Being Canceled",  bg: "rgba(107,114,128,0.1)","color": "#6b7280" },
};

const ALL_STATUSES = Object.entries(STATUS_META) as [LoanStatus, typeof STATUS_META[LoanStatus]][];

function StatusBadge({ status }: { status: LoanStatus }) {
  const m = STATUS_META[status];
  return (
    <span style={{ background: m.bg, color: m.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
      {m.label}
    </span>
  );
}

function formatRM(amount: string | number) {
  return "RM " + Number(amount).toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MemberListPage() {
  const [rows, setRows] = useState<LoanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<LoanStatus | "all">("all");
  const [inputSearch, setInputSearch] = useState("");

  const [editRow, setEditRow] = useState<LoanRow | null>(null);
  const [newStatus, setNewStatus] = useState<LoanStatus>("under_review");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const fetchLoans = async (search = "", status: LoanStatus | "all" = filterStatus) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/loans?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLoans("", filterStatus); }, [filterStatus]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchLoans(inputSearch, filterStatus); };

  const openEdit = (row: LoanRow) => {
    setEditRow(row);
    setNewStatus(row.status);
    setEditError("");
  };

  const handleSaveStatus = async () => {
    if (!editRow) return;
    setEditLoading(true); setEditError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/loans/${editRow.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.message || "Ralat."); return; }
      setEditRow(null);
      fetchLoans(inputSearch, filterStatus);
    } catch {
      setEditError("Ralat sambungan.");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Member List</h1>
          <p style={{ color: "#888", fontSize: 13 }}>Senarai pinjaman ahli dan status semasa</p>
        </div>
        <button onClick={() => fetchLoans(inputSearch, filterStatus)} style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: 8, padding: "8px 14px", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "inherit" }}>
          <RefreshCw size={13} /> Muat Semula
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#555" }} />
            <input
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              placeholder="Cari UID atau Nombor HP..."
              style={{ background: "#111", border: "1px solid #2e2e2e", borderRadius: 8, padding: "8px 12px 8px 30px", color: "#fff", fontSize: 13, outline: "none", width: 220, fontFamily: "inherit" }}
            />
          </div>
          <button type="submit" style={{ background: "#c9a84c", color: "#000", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cari</button>
        </form>

        <div style={{ position: "relative" }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={{ background: "#111", border: "1px solid #2e2e2e", borderRadius: 8, padding: "8px 32px 8px 12px", color: "#fff", fontSize: 13, outline: "none", cursor: "pointer", fontFamily: "inherit", appearance: "none" }}
          >
            <option value="all">Semua Status</option>
            {ALL_STATUSES.map(([key, m]) => (
              <option key={key} value={key}>{m.label}</option>
            ))}
          </select>
          <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#666", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e1e1e", background: "#0c0c0c" }}>
                {["UID", "Nombor HP", "Nominal Withdraw", "Tanggal Pinjam", "Status Pinjaman", "Tindakan"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 44, color: "#555", fontSize: 13 }}>Memuatkan...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 44, color: "#555", fontSize: 13 }}>Tiada rekod pinjaman dijumpai.</td></tr>
              ) : rows.map((row, i) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #161616", background: i % 2 === 0 ? "transparent" : "#0a0a0a" }}>
                  <td style={{ padding: "13px 16px", color: "#c9a84c", fontWeight: 700, fontFamily: "monospace", fontSize: 13 }}>
                    #{String(row.user_id).padStart(4, "0")}
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "#ccc", fontFamily: "monospace" }}>{row.phone}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "#fff", fontWeight: 600 }}>{formatRM(row.amount)}</td>
                  <td style={{ padding: "13px 16px", fontSize: 12, color: "#666", whiteSpace: "nowrap" }}>
                    {new Date(row.created_at).toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ padding: "13px 16px" }}><StatusBadge status={row.status} /></td>
                  <td style={{ padding: "13px 16px" }}>
                    <button
                      onClick={() => openEdit(row)}
                      style={{ background: "rgba(201,168,76,0.1)", border: "none", borderRadius: 7, padding: "6px 12px", cursor: "pointer", color: "#c9a84c", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}
                    >
                      Ubah Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "10px 16px", borderTop: "1px solid #1a1a1a" }}>
          <span style={{ fontSize: 12, color: "#555" }}>{rows.length} rekod</span>
        </div>
      </div>

      {/* Change Status Modal */}
      {editRow && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "#111", border: "1px solid #2e2e2e", borderRadius: 16, padding: 28, width: "100%", maxWidth: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>Ubah Status Pinjaman</h2>
              <button onClick={() => setEditRow(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#666", display: "flex" }}><X size={18} /></button>
            </div>

            {/* Loan summary */}
            <div style={{ background: "#0c0c0c", borderRadius: 10, padding: "14px 16px", marginBottom: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
              {[
                ["UID", `#${String(editRow.user_id).padStart(4, "0")}`],
                ["Nombor HP", editRow.phone],
                ["Nominal", formatRM(editRow.amount)],
                ["Tarikh", new Date(editRow.created_at).toLocaleDateString("ms-MY")],
              ].map(([label, val]) => (
                <div key={label}>
                  <p style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 13, color: "#ccc", fontFamily: "monospace" }}>{val}</p>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 11, color: "#666", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Status Baru</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ALL_STATUSES.map(([key, m]) => (
                  <label key={key} onClick={() => setNewStatus(key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: newStatus === key ? "rgba(201,168,76,0.06)" : "#0c0c0c", border: `1px solid ${newStatus === key ? "rgba(201,168,76,0.3)" : "#1e1e1e"}`, borderRadius: 9, cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${newStatus === key ? "#c9a84c" : "#333"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {newStatus === key && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#c9a84c" }} />}
                    </div>
                    <span style={{ background: m.bg, color: m.color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {editError && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12 }}>{editError}</p>}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setEditRow(null)} style={{ background: "#1e1e1e", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, color: "#888", cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
              <button onClick={handleSaveStatus} disabled={editLoading} style={{ background: "#c9a84c", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, opacity: editLoading ? 0.7 : 1 }}>
                <Save size={14} /> {editLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
