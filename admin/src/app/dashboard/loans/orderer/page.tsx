"use client";
import { useEffect, useState } from "react";
import { Search, RefreshCw, ChevronDown, X, Save, Eye, Edit2, Trash2 } from "lucide-react";

interface LoanRow {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  ic: string | null;
  amount: string;
  loan_terms: string | null;
  bank: string | null;
  no_rekening: string | null;
  account_name: string | null;
  sign_url: string | null;
  front_ic_url: string | null;
  back_ic_url: string | null;
  selfie_url: string | null;
  keterangan: string | null;
  status: LoanStatus;
  created_at: string;
}

type LoanStatus =
  | "under_review" | "loan_approved" | "credit_frozen"
  | "unfrozen_processing" | "credit_score_low" | "payment_processing" | "loan_being_canceled" | "transfer_failed";

const STATUS_META: Record<LoanStatus, { label: string; bg: string; color: string }> = {
  under_review:        { label: "Under Review",        bg: "rgba(201,168,76,0.12)",  color: "#c9a84c" },
  loan_approved:       { label: "Loan Approved",        bg: "rgba(34,197,94,0.1)",   color: "#22c55e" },
  credit_frozen:       { label: "Credit Frozen",        bg: "rgba(239,68,68,0.1)",   color: "#ef4444" },
  unfrozen_processing: { label: "Unfrozen Processing",  bg: "rgba(251,146,60,0.1)",  color: "#fb923c" },
  credit_score_low:    { label: "Credit Score Low",     bg: "rgba(239,68,68,0.08)",  color: "#f87171" },
  payment_processing:  { label: "Payment Processing",   bg: "rgba(99,102,241,0.1)",  color: "#818cf8" },
  loan_being_canceled: { label: "Loan Being Canceled",  bg: "rgba(107,114,128,0.1)", color: "#6b7280" },
  transfer_failed:     { label: "Transfer Failed",      bg: "rgba(239,68,68,0.12)",  color: "#ef4444" },
};

const ALL_STATUSES = Object.entries(STATUS_META) as [LoanStatus, typeof STATUS_META[LoanStatus]][];

type KeteranganTemplates = Partial<Record<LoanStatus, string>>;

function StatusBadge({ status }: { status: LoanStatus }) {
  const m = STATUS_META[status];
  return (
    <span style={{ background: m.bg, color: m.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
      {m.label}
    </span>
  );
}

function formatRM(v: string | number | null) {
  if (v === null || v === undefined) return "—";
  return "RM " + Number(v).toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function FieldBlock({ label, value, mono, full }: { label: string; value: string; mono?: boolean; full?: boolean }) {
  return (
    <div style={full ? { gridColumn: "1 / -1" } : {}}>
      <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 13, color: value && value !== "—" ? "var(--text-primary)" : "var(--text-muted)", fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{value || "—"}</p>
    </div>
  );
}

function ReadOnlyField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ ...inputStyle, color: "var(--text-secondary)", cursor: "not-allowed", userSelect: "none" as const, fontFamily: mono ? "monospace" : "inherit" }}>
        {value}
      </div>
    </div>
  );
}

export default function OrdererPage() {
  const [rows, setRows] = useState<LoanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputSearch, setInputSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<LoanStatus | "all">("all");
  const [templates, setTemplates] = useState<KeteranganTemplates>({});

  const [viewRow, setViewRow] = useState<LoanRow | null>(null);
  const [editRow, setEditRow] = useState<LoanRow | null>(null);
  const [editPhone, setEditPhone] = useState("");
  const [editIc, setEditIc] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editLoanTerms, setEditLoanTerms] = useState("");
  const [editBank, setEditBank] = useState("");
  const [editNoRek, setEditNoRek] = useState("");
  const [editAccountName, setEditAccountName] = useState("");
  const [editStatus, setEditStatus] = useState<LoanStatus>("under_review");
  const [editKeterangan, setEditKeterangan] = useState("");
  const [editSignUrl, setEditSignUrl] = useState("");
  const [editFrontIcUrl, setEditFrontIcUrl] = useState("");
  const [editBackIcUrl, setEditBackIcUrl] = useState("");
  const [editSelfieUrl, setEditSelfieUrl] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const [deleteRow, setDeleteRow] = useState<LoanRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";
  const adminRole = typeof window !== "undefined" ? localStorage.getItem("admin_role") : "";

  // Load keterangan templates from settings
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`)
      .then((r) => r.json())
      .then((data) => {
        const t: KeteranganTemplates = {};
        for (const s of Object.keys(STATUS_META) as LoanStatus[]) {
          t[s] = data[`keterangan_${s}`] || "";
        }
        setTemplates(t);
      })
      .catch(() => {});
  }, []);

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

  const openEdit = (row: LoanRow) => {
    setEditRow(row);
    setEditPhone(row.phone);
    setEditIc(row.ic || "");
    setEditAmount(String(row.amount));
    setEditLoanTerms(row.loan_terms || "");
    setEditBank(row.bank || "");
    setEditNoRek(row.no_rekening || "");
    setEditAccountName(row.account_name || "");
    setEditSignUrl(row.sign_url || "");
    setEditFrontIcUrl(row.front_ic_url || "");
    setEditBackIcUrl(row.back_ic_url || "");
    setEditSelfieUrl(row.selfie_url || "");
    setEditStatus(row.status);
    setEditKeterangan(row.keterangan || "");
    setEditError("");
  };

  // When status changes in edit modal, auto-fill keterangan from template
  const handleStatusChange = (newStatus: LoanStatus) => {
    setEditStatus(newStatus);
    const tpl = templates[newStatus];
    if (tpl) setEditKeterangan(tpl);
  };

  const handleSave = async () => {
    if (!editRow) return;
    setEditLoading(true); setEditError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/loans/${editRow.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          phone: editPhone,
          ic: editIc,
          amount: editAmount,
          loan_terms: editLoanTerms || null,
          bank: editBank || null,
          no_rekening: editNoRek || null,
          account_name: editAccountName || null,
          sign_url: editSignUrl || null,
          front_ic_url: editFrontIcUrl || null,
          back_ic_url: editBackIcUrl || null,
          selfie_url: editSelfieUrl || null,
          keterangan: editKeterangan || null,
          status: editStatus,
        }),
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

  const handleDelete = async () => {
    if (!deleteRow) return;
    setDeleteLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/loans/${deleteRow.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteRow(null);
      fetchData(inputSearch, filterStatus);
    } catch {
      // silent
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Loans — Orderer</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Senarai permohonan pinjaman pelanggan</p>
        </div>
        <button onClick={() => fetchData(inputSearch, filterStatus)} style={{ background: "var(--bg-card-inner)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "8px 14px", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "inherit" }}>
          <RefreshCw size={13} /> Muat Semula
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input value={inputSearch} onChange={(e) => setInputSearch(e.target.value)} placeholder="Cari nama, UID atau nombor HP..."
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "8px 12px 8px 30px", color: "var(--text-primary)", fontSize: 13, outline: "none", width: 240, fontFamily: "inherit" }} />
          </div>
          <button type="submit" style={{ background: "#c9a84c", color: "#000", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cari</button>
        </form>
        <div style={{ position: "relative" }}>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as LoanStatus | "all")}
            style={{ background: "var(--bg-primary)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "8px 30px 8px 12px", color: "var(--text-primary)", fontSize: 13, outline: "none", cursor: "pointer", fontFamily: "inherit", appearance: "none" }}>
            <option value="all">Semua Status</option>
            {ALL_STATUSES.map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
          </select>
          <ChevronDown size={13} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", background: "var(--nav-bg)" }}>
                {["Order No.", "Username", "Phone Number", "UID", "Loan Amount", "Loan Terms", "Sign", "Application Time", "Status", "Tindakan"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: 44, color: "var(--text-muted)", fontSize: 13 }}>Memuatkan...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: 44, color: "var(--text-muted)", fontSize: 13 }}>Tiada permohonan dijumpai.</td></tr>
              ) : rows.map((row, i) => (
                <tr key={row.id} style={{ borderBottom: "1px solid var(--bg-card)", background: i % 2 === 0 ? "transparent" : "var(--bg-primary)" }}>
                  <td style={{ padding: "13px 16px", color: "#c9a84c", fontWeight: 700, fontFamily: "monospace", fontSize: 13, whiteSpace: "nowrap" }}>
                    #ORD-{String(row.id).padStart(5, "0")}
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--text-primary)", fontFamily: "monospace" }}>{row.phone}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--text-primary)", fontFamily: "monospace" }}>{row.phone}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--text-secondary)", fontFamily: "monospace" }}>#{String(row.user_id).padStart(4, "0")}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{formatRM(row.amount)}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--text-secondary)" }}>{row.loan_terms || <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                  <td style={{ padding: "13px 16px" }}>
                    {row.sign_url
                      ? <img src={row.sign_url} alt="Sign" style={{ height: 30, maxWidth: 70, objectFit: "contain", background: "#fff", borderRadius: 4, padding: 2 }} />
                      : <span style={{ color: "var(--text-muted)", fontSize: 13 }}>—</span>}
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{formatDate(row.created_at)}</td>
                  <td style={{ padding: "13px 16px" }}><StatusBadge status={row.status} /></td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => setViewRow(row)} title="Lihat"
                        style={{ background: "rgba(99,102,241,0.1)", border: "none", borderRadius: 7, padding: "6px 9px", cursor: "pointer", color: "#818cf8", display: "flex", alignItems: "center" }}>
                        <Eye size={13} />
                      </button>
                      <button onClick={() => openEdit(row)} title="Edit"
                        style={{ background: "rgba(201,168,76,0.1)", border: "none", borderRadius: 7, padding: "6px 9px", cursor: "pointer", color: "#c9a84c", display: "flex", alignItems: "center" }}>
                        <Edit2 size={13} />
                      </button>
                      {adminRole === "admin" && (
                        <button onClick={() => setDeleteRow(row)} title="Padam"
                          style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 7, padding: "6px 9px", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center" }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "10px 16px", borderTop: "1px solid var(--bg-card)" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{rows.length} permohonan</span>
        </div>
      </div>

      {/* ── View Modal ── */}
      {viewRow && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-light)", borderRadius: 16, width: "100%", maxWidth: 540, maxHeight: "88vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px 14px", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 800 }}>Detail Permohonan</h2>
                <p style={{ fontSize: 12, color: "#c9a84c", fontFamily: "monospace", marginTop: 2 }}>#ORD-{String(viewRow.id).padStart(5, "0")}</p>
              </div>
              <button onClick={() => setViewRow(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}><X size={18} /></button>
            </div>

            <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
                <FieldBlock label="Order Number" value={`#ORD-${String(viewRow.id).padStart(5, "0")}`} mono />
                <FieldBlock label="UID" value={`#${String(viewRow.user_id).padStart(4, "0")}`} mono />
                <FieldBlock label="Phone Number" value={viewRow.phone} mono />
                <FieldBlock label="Id Card Number" value={viewRow.ic || ""} mono />
                <FieldBlock label="Loan Amount" value={formatRM(viewRow.amount)} />
                <FieldBlock label="Loan Period" value={viewRow.loan_terms || ""} />
                <FieldBlock label="Bank" value={viewRow.bank || ""} />
                <FieldBlock label="Nomor Rekening" value={viewRow.no_rekening || ""} mono />
                <FieldBlock label="Nama Pemegang Kad" value={viewRow.account_name || ""} />
                <FieldBlock label="Application Time" value={formatDate(viewRow.created_at)} full />

                {/* Document Images */}
                {(viewRow.sign_url || viewRow.front_ic_url || viewRow.back_ic_url || viewRow.selfie_url) && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <p style={{ fontSize: 10, color: "#c9a84c", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--border-color)" }}>Dokumen</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {[
                        { label: "Tanda Tangan", url: viewRow.sign_url },
                        { label: "Front IC",     url: viewRow.front_ic_url },
                        { label: "Back IC",      url: viewRow.back_ic_url },
                        { label: "Selfie",       url: viewRow.selfie_url },
                      ].map(({ label, url }) => (
                        <div key={label}>
                          <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{label}</p>
                          {url ? (
                            <a href={url} target="_blank" rel="noreferrer" style={{ display: "block" }}>
                              <img src={url} alt={label} style={{ width: "100%", maxHeight: 130, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border-light)", background: "var(--nav-bg)", display: "block" }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            </a>
                          ) : (
                            <div style={{ height: 80, borderRadius: 8, border: "1px dashed var(--border-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 12 }}>Tiada gambar</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ gridColumn: "1 / -1" }}>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Status</p>
                  <StatusBadge status={viewRow.status} />
                </div>

                {viewRow.keterangan && (
                  <FieldBlock label="Keterangan" value={viewRow.keterangan} full />
                )}
              </div>
            </div>

            <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
              <button onClick={() => { setViewRow(null); openEdit(viewRow); }}
                style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#c9a84c", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                <Edit2 size={13} /> Ubah
              </button>
              <button onClick={() => setViewRow(null)} style={{ background: "var(--bg-card-inner)", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editRow && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-light)", borderRadius: 16, width: "100%", maxWidth: 540, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px 14px", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 800 }}>Edit Permohonan</h2>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>#ORD-{String(editRow.id).padStart(5, "0")} · UID #{String(editRow.user_id).padStart(4, "0")}</p>
              </div>
              <button onClick={() => setEditRow(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}><X size={18} /></button>
            </div>

            <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px" }}>

                {/* Read-only */}
                <ReadOnlyField label="Order Number" value={`#ORD-${String(editRow.id).padStart(5, "0")}`} mono />
                <ReadOnlyField label="UID" value={`#${String(editRow.user_id).padStart(4, "0")}`} mono />

                {/* Editable */}
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} style={{ ...inputStyle, fontFamily: "monospace" }} />
                </div>
                <div>
                  <label style={labelStyle}>Id Card Number</label>
                  <input value={editIc} onChange={(e) => setEditIc(e.target.value)} style={{ ...inputStyle, fontFamily: "monospace" }} />
                </div>
                <div>
                  <label style={labelStyle}>Loan Amount (RM)</label>
                  <input type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Loan Period</label>
                  <input value={editLoanTerms} onChange={(e) => setEditLoanTerms(e.target.value)} placeholder="cth: 12 Bulan" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Bank</label>
                  <input value={editBank} onChange={(e) => setEditBank(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Nomor Rekening</label>
                  <input value={editNoRek} onChange={(e) => setEditNoRek(e.target.value)} style={{ ...inputStyle, fontFamily: "monospace" }} />
                </div>
                <div>
                  <label style={labelStyle}>Nama Pemegang Kad</label>
                  <input value={editAccountName} onChange={(e) => setEditAccountName(e.target.value)} placeholder="Nama seperti dalam kad bank" style={inputStyle} />
                </div>

                {/* Application Time display */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Application Time</label>
                  <div style={{ ...inputStyle, color: "var(--text-secondary)", cursor: "not-allowed" }}>{formatDate(editRow.created_at)}</div>
                </div>

                {/* Document images */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <p style={{ fontSize: 10, color: "#c9a84c", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", paddingBottom: 6, borderBottom: "1px solid var(--border-color)", marginBottom: 12 }}>Dokumen (URL Gambar)</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
                    {([
                      { label: "Tanda Tangan", val: editSignUrl,    set: setEditSignUrl },
                      { label: "Front IC",     val: editFrontIcUrl, set: setEditFrontIcUrl },
                      { label: "Back IC",      val: editBackIcUrl,  set: setEditBackIcUrl },
                      { label: "Selfie",       val: editSelfieUrl,  set: setEditSelfieUrl },
                    ] as { label: string; val: string; set: (v: string) => void }[]).map(({ label, val, set }) => (
                      <div key={label}>
                        <label style={labelStyle}>{label}</label>
                        <input value={val} onChange={(e) => set(e.target.value)} placeholder="https://..." style={inputStyle} />
                        {val && (
                          <img src={val} alt={label} style={{ marginTop: 6, width: "100%", maxHeight: 80, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border-light)", background: "var(--nav-bg)" }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status selection */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Status</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                    {ALL_STATUSES.map(([key, m]) => (
                      <label key={key} onClick={() => handleStatusChange(key)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", background: editStatus === key ? "rgba(201,168,76,0.06)" : "var(--nav-bg)", border: `1px solid ${editStatus === key ? "rgba(201,168,76,0.3)" : "var(--border-color)"}`, borderRadius: 9, cursor: "pointer" }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${editStatus === key ? "#c9a84c" : "var(--border-light)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {editStatus === key && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#c9a84c" }} />}
                        </div>
                        <span style={{ background: m.bg, color: m.color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>{m.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Keterangan */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Keterangan</label>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Auto-diisi daripada template settings apabila status ditukar. Boleh diedit secara manual.</p>
                  <textarea
                    value={editKeterangan}
                    onChange={(e) => setEditKeterangan(e.target.value)}
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical", minHeight: 90, lineHeight: 1.6 }}
                  />
                </div>
              </div>
              {editError && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 14 }}>{editError}</p>}
            </div>

            <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border-color)", display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0 }}>
              <button onClick={() => setEditRow(null)} style={{ background: "var(--bg-card-inner)", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
              <button onClick={handleSave} disabled={editLoading}
                style={{ background: "#c9a84c", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, opacity: editLoading ? 0.7 : 1 }}>
                <Save size={14} /> {editLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteRow && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-light)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 380 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>Padam Permohonan</h2>
              <button onClick={() => setDeleteRow(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>Tindakan ini tidak boleh dibatalkan.</p>
            <div style={{ background: "var(--nav-bg)", borderRadius: 9, padding: "12px 14px", marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: "#c9a84c", fontFamily: "monospace", fontWeight: 700 }}>#ORD-{String(deleteRow.id).padStart(5, "0")}</p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{deleteRow.name} · {formatRM(deleteRow.amount)}</p>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteRow(null)} style={{ background: "var(--bg-card-inner)", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
              <button onClick={handleDelete} disabled={deleteLoading}
                style={{ background: "#ef4444", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#fff", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, opacity: deleteLoading ? 0.7 : 1 }}>
                <Trash2 size={14} /> {deleteLoading ? "Memadamkan..." : "Ya, Padam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1,
  textTransform: "uppercase", display: "block", marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--nav-bg)", border: "1px solid var(--border-light)",
  borderRadius: 8, padding: "9px 12px", color: "var(--text-primary)", fontSize: 13,
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
