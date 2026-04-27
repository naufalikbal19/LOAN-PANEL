"use client";
import { useEffect, useState } from "react";
import { Search, RefreshCw, ChevronDown, X, Save, Eye, Edit2 } from "lucide-react";

interface WithdrawalRow {
  id: number;
  user_id: number;
  phone: string;
  amount: string;
  bank: string | null;
  no_rekening: string | null;
  account_name: string | null;
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
  | "loan_being_canceled"
  | "transfer_failed";

const STATUS_META: Record<LoanStatus, { label: string; bg: string; color: string }> = {
  under_review:        { label: "Under Review",        bg: "rgba(201,168,76,0.12)", color: "#c9a84c" },
  loan_approved:       { label: "Loan Approved",        bg: "rgba(34,197,94,0.1)",  color: "#22c55e" },
  credit_frozen:       { label: "Credit Frozen",        bg: "rgba(239,68,68,0.1)",  color: "#ef4444" },
  unfrozen_processing: { label: "Unfrozen Processing",  bg: "rgba(251,146,60,0.1)", color: "#fb923c" },
  credit_score_low:    { label: "Credit Score Low",     bg: "rgba(239,68,68,0.08)", color: "#f87171" },
  payment_processing:  { label: "Payment Processing",   bg: "rgba(99,102,241,0.1)", color: "#818cf8" },
  loan_being_canceled: { label: "Loan Being Canceled",  bg: "rgba(107,114,128,0.1)", color: "#6b7280" },
  transfer_failed:     { label: "Transfer Failed",      bg: "rgba(239,68,68,0.12)",  color: "#ef4444" },
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

function FieldBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 13, color: value ? "var(--text-primary)" : "var(--text-muted)", fontFamily: "monospace" }}>{value || "—"}</p>
    </div>
  );
}

export default function WithdrawalPage() {
  const [rows, setRows] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<LoanStatus | "all">("all");
  const [inputSearch, setInputSearch] = useState("");

  const [viewRow, setViewRow] = useState<WithdrawalRow | null>(null);

  const [editRow, setEditRow] = useState<WithdrawalRow | null>(null);
  const [editPhone, setEditPhone] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editBank, setEditBank] = useState("");
  const [editNoRek, setEditNoRek] = useState("");
  const [editAccountName, setEditAccountName] = useState("");
  const [editStatus, setEditStatus] = useState<LoanStatus>("under_review");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const fetchData = async (search = "", status: LoanStatus | "all" = filterStatus) => {
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

  useEffect(() => { fetchData("", filterStatus); }, [filterStatus]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); fetchData(inputSearch, filterStatus); };

  const openEdit = (row: WithdrawalRow) => {
    setEditRow(row);
    setEditPhone(row.phone);
    setEditAmount(String(row.amount));
    setEditBank(row.bank || "");
    setEditNoRek(row.no_rekening || "");
    setEditAccountName(row.account_name || "");
    setEditStatus(row.status);
    setEditError("");
  };

  const handleSave = async () => {
    if (!editRow) return;
    setEditLoading(true); setEditError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/loans/${editRow.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: editPhone, amount: editAmount, bank: editBank, no_rekening: editNoRek, account_name: editAccountName, status: editStatus }),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.message || "Ralat."); return; }
      setEditRow(null);
      fetchData(inputSearch, filterStatus);
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
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Withdrawal Records</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Rekod pengeluaran wang dan maklumat akaun bank ahli</p>
        </div>
        <button onClick={() => fetchData(inputSearch, filterStatus)} style={{ background: "var(--bg-card-inner)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "8px 14px", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "inherit" }}>
          <RefreshCw size={13} /> Muat Semula
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              placeholder="Cari UID atau Nombor HP..."
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "8px 12px 8px 30px", color: "var(--text-primary)", fontSize: 13, outline: "none", width: 220, fontFamily: "inherit" }}
            />
          </div>
          <button type="submit" style={{ background: "#c9a84c", color: "#000", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cari</button>
        </form>

        <div style={{ position: "relative" }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "8px 32px 8px 12px", color: "var(--text-primary)", fontSize: 13, outline: "none", cursor: "pointer", fontFamily: "inherit", appearance: "none" }}
          >
            <option value="all">Semua Status</option>
            {ALL_STATUSES.map(([key, m]) => (
              <option key={key} value={key}>{m.label}</option>
            ))}
          </select>
          <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", background: "var(--nav-bg)" }}>
                {["UID", "Nombor HP", "Nominal Withdraw", "Bank", "No. Rekening", "Tanggal Pinjam", "Status", "Tindakan"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 44, color: "var(--text-muted)", fontSize: 13 }}>Memuatkan...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 44, color: "var(--text-muted)", fontSize: 13 }}>Tiada rekod dijumpai.</td></tr>
              ) : rows.map((row, i) => (
                <tr key={row.id} style={{ borderBottom: "1px solid var(--border-color)", background: i % 2 === 0 ? "transparent" : "var(--bg-card-inner)" }}>
                  <td style={{ padding: "13px 16px", color: "#c9a84c", fontWeight: 700, fontFamily: "monospace", fontSize: 13 }}>
                    #{String(row.user_id).padStart(4, "0")}
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--text-primary)", fontFamily: "monospace" }}>{row.phone}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{formatRM(row.amount)}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--text-primary)" }}>{row.bank || <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--text-primary)", fontFamily: "monospace" }}>{row.no_rekening || <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                  <td style={{ padding: "13px 16px", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                    {new Date(row.created_at).toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ padding: "13px 16px" }}><StatusBadge status={row.status} /></td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => setViewRow(row)}
                        style={{ background: "rgba(99,102,241,0.1)", border: "none", borderRadius: 7, padding: "6px 10px", cursor: "pointer", color: "#818cf8", fontSize: 12, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}
                      >
                        <Eye size={12} /> Lihat
                      </button>
                      <button
                        onClick={() => openEdit(row)}
                        style={{ background: "rgba(201,168,76,0.1)", border: "none", borderRadius: 7, padding: "6px 10px", cursor: "pointer", color: "#c9a84c", fontSize: 12, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}
                      >
                        <Edit2 size={12} /> Ubah
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border-color)" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{rows.length} rekod</span>
        </div>
      </div>

      {/* View Modal */}
      {viewRow && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 440 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>Detail Withdrawal</h2>
              <button onClick={() => setViewRow(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}><X size={18} /></button>
            </div>

            <div style={{ background: "var(--nav-bg)", borderRadius: 10, padding: "16px", marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
              <FieldBlock label="UID" value={`#${String(viewRow.user_id).padStart(4, "0")}`} />
              <FieldBlock label="Nombor HP" value={viewRow.phone} />
              <FieldBlock label="Nominal Withdraw" value={formatRM(viewRow.amount)} />
              <FieldBlock label="Tanggal Pinjam" value={new Date(viewRow.created_at).toLocaleDateString("ms-MY", { day: "2-digit", month: "long", year: "numeric" })} />
              <FieldBlock label="Bank" value={viewRow.bank || ""} />
              <FieldBlock label="No. Rekening" value={viewRow.no_rekening || ""} />
              <FieldBlock label="Nama Pemegang Kad" value={viewRow.account_name || ""} />
            </div>

            <div style={{ background: "var(--nav-bg)", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
              <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Status</p>
              <StatusBadge status={viewRow.status} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => { setViewRow(null); openEdit(viewRow); }} style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#c9a84c", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                <Edit2 size={13} /> Ubah
              </button>
              <button onClick={() => setViewRow(null)} style={{ background: "var(--bg-card-inner)", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editRow && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24, overflowY: "auto" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 460, margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800 }}>Ubah Data Withdrawal</h2>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>UID #{String(editRow.user_id).padStart(4, "0")}</p>
              </div>
              <button onClick={() => setEditRow(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}><X size={18} /></button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px", marginBottom: 20 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Nombor HP</label>
                <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                  style={{ width: "100%", background: "var(--nav-bg)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "9px 12px", color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "monospace", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Nominal Withdraw (RM)</label>
                <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)}
                  style={{ width: "100%", background: "var(--nav-bg)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "9px 12px", color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Bank</label>
                <input value={editBank} onChange={(e) => setEditBank(e.target.value)} placeholder="Cth: Maybank"
                  style={{ width: "100%", background: "var(--nav-bg)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "9px 12px", color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>No. Rekening</label>
                <input value={editNoRek} onChange={(e) => setEditNoRek(e.target.value)} placeholder="Nombor akaun bank"
                  style={{ width: "100%", background: "var(--nav-bg)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "9px 12px", color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "monospace", boxSizing: "border-box" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Nama Pemegang Kad</label>
                <input value={editAccountName} onChange={(e) => setEditAccountName(e.target.value)} placeholder="Nama seperti dalam kad bank"
                  style={{ width: "100%", background: "var(--nav-bg)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "9px 12px", color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            </div>

            <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Status</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 6 }}>
              {ALL_STATUSES.map(([key, m]) => (
                <label key={key} onClick={() => setEditStatus(key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", background: editStatus === key ? "rgba(201,168,76,0.06)" : "var(--nav-bg)", border: `1px solid ${editStatus === key ? "rgba(201,168,76,0.3)" : "var(--border-color)"}`, borderRadius: 9, cursor: "pointer" }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${editStatus === key ? "#c9a84c" : "var(--border-light)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {editStatus === key && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#c9a84c" }} />}
                  </div>
                  <span style={{ background: m.bg, color: m.color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>{m.label}</span>
                </label>
              ))}
            </div>

            {editError && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12 }}>{editError}</p>}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setEditRow(null)} style={{ background: "var(--bg-card-inner)", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
              <button onClick={handleSave} disabled={editLoading} style={{ background: "#c9a84c", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, opacity: editLoading ? 0.7 : 1 }}>
                <Save size={14} /> {editLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
