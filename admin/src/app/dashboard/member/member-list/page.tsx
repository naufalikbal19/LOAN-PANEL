"use client";
import { useEffect, useState } from "react";
import { Search, RefreshCw, X, Save, Eye, Edit2, Trash2, RefreshCcw, ChevronDown } from "lucide-react";

interface MemberRow {
  id: number;
  name: string;
  ic: string | null;
  phone: string;
  status: "pending" | "active" | "rejected";
  member_status: MemberStatus;
  credit_score: number;
  withdrawal_password: string | null;
  balance: string;
  pending_loans: number;
  created_at: string;
  ip_client: string | null;
  avatar: string | null;
  level: number;
  gender: string | null;
  bank: string | null;
  no_rekening: string | null;
  account_name: string | null;
  birthday: string | null;
  loan_purpose: string | null;
  monthly_income: string | null;
  current_address: string | null;
  motto: string | null;
  points: number;
  consecutive_login_days: number;
  number_of_failures: number;
}

type MemberStatus = "normal" | "suspended" | "blocked";
type RegStatus = "all" | "active" | "pending" | "rejected";

const MEMBER_STATUS_META: Record<MemberStatus, { label: string; bg: string; color: string }> = {
  normal:    { label: "Normal",    bg: "rgba(34,197,94,0.1)",  color: "#22c55e" },
  suspended: { label: "Suspended", bg: "rgba(251,146,60,0.1)", color: "#fb923c" },
  blocked:   { label: "Blocked",   bg: "rgba(239,68,68,0.1)",  color: "#ef4444" },
};

const REG_STATUS_META: Record<"pending" | "active" | "rejected", { label: string; color: string }> = {
  pending:  { label: "Pending",  color: "#fb923c" },
  active:   { label: "Active",   color: "#22c55e" },
  rejected: { label: "Rejected", color: "#ef4444" },
};

function StatusBadge({ status }: { status: MemberStatus }) {
  const m = MEMBER_STATUS_META[status];
  return (
    <span style={{ background: m.bg, color: m.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
      {m.label}
    </span>
  );
}

function RegBadge({ status }: { status: "pending" | "active" | "rejected" }) {
  const m = REG_STATUS_META[status];
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: m.color, opacity: 0.8 }}>{m.label}</span>
  );
}

function formatRM(amount: string | number | null) {
  if (amount === null || amount === undefined) return "—";
  return "RM " + Number(amount).toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" });
}

function FieldBlock({ label, value, mono, full }: { label: string; value: string; mono?: boolean; full?: boolean }) {
  return (
    <div style={full ? { gridColumn: "1 / -1" } : {}}>
      <p style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 13, color: value && value !== "—" ? "#ccc" : "#444", fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-word" }}>{value || "—"}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{ fontSize: 10, color: "#c9a84c", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", gridColumn: "1 / -1", marginTop: 4, paddingBottom: 6, borderBottom: "1px solid #1e1e1e" }}>
      {children}
    </p>
  );
}

export default function MemberListPage() {
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputSearch, setInputSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<RegStatus>("all");

  const [viewRow, setViewRow] = useState<MemberRow | null>(null);

  const [editRow, setEditRow] = useState<MemberRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editIc, setEditIc] = useState("");
  const [editCreditScore, setEditCreditScore] = useState("");
  const [editWithdrawPw, setEditWithdrawPw] = useState("");
  const [editBalance, setEditBalance] = useState("");
  const [editMemberStatus, setEditMemberStatus] = useState<MemberStatus>("normal");
  const [editIpClient, setEditIpClient] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editLevel, setEditLevel] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editBank, setEditBank] = useState("");
  const [editNoRekening, setEditNoRekening] = useState("");
  const [editAccountName, setEditAccountName] = useState("");
  const [editBirthday, setEditBirthday] = useState("");
  const [editLoanPurpose, setEditLoanPurpose] = useState("");
  const [editMonthlyIncome, setEditMonthlyIncome] = useState("");
  const [editCurrentAddress, setEditCurrentAddress] = useState("");
  const [editMotto, setEditMotto] = useState("");
  const [editPoints, setEditPoints] = useState("");
  const [editConsecutiveDays, setEditConsecutiveDays] = useState("");
  const [editNumFailures, setEditNumFailures] = useState("");
  const [editNewPassword, setEditNewPassword] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const [deleteRow, setDeleteRow] = useState<MemberRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";
  const adminRole = typeof window !== "undefined" ? localStorage.getItem("admin_role") : "";

  const fetchMembers = async (search = "", status: RegStatus = filterStatus) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (search) params.set("search", search);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?${params}`, {
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

  useEffect(() => { fetchMembers("", filterStatus); }, [filterStatus]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); fetchMembers(inputSearch, filterStatus); };

  const openEdit = (row: MemberRow) => {
    setEditRow(row);
    setEditName(row.name);
    setEditPhone(row.phone);
    setEditIc(row.ic || "");
    setEditCreditScore(String(row.credit_score));
    setEditWithdrawPw(row.withdrawal_password || "");
    setEditBalance(String(row.balance));
    setEditMemberStatus(row.member_status || "normal");
    setEditIpClient(row.ip_client || "");
    setEditAvatar(row.avatar || "");
    setEditLevel(String(row.level ?? 1));
    setEditGender(row.gender || "");
    setEditBank(row.bank || "");
    setEditNoRekening(row.no_rekening || "");
    setEditAccountName(row.account_name || "");
    setEditBirthday(row.birthday ? row.birthday.split("T")[0] : "");
    setEditLoanPurpose(row.loan_purpose || "");
    setEditMonthlyIncome(row.monthly_income || "");
    setEditCurrentAddress(row.current_address || "");
    setEditMotto(row.motto || "");
    setEditPoints(String(row.points ?? 0));
    setEditConsecutiveDays(String(row.consecutive_login_days ?? 0));
    setEditNumFailures(String(row.number_of_failures ?? 0));
    setEditNewPassword("");
    setEditError("");
  };

  const generatePassword = () => {
    setEditWithdrawPw(String(Math.floor(100000 + Math.random() * 900000)));
  };

  const handleSave = async () => {
    if (!editRow) return;
    setEditLoading(true); setEditError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${editRow.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: editName || undefined,
          phone: editPhone || undefined,
          ic: editIc || undefined,
          credit_score: editCreditScore ? Number(editCreditScore) : undefined,
          withdrawal_password: editWithdrawPw || undefined,
          balance: editBalance || undefined,
          member_status: editMemberStatus,
          ip_client: editIpClient || null,
          avatar: editAvatar || null,
          level: editLevel ? Number(editLevel) : undefined,
          gender: editGender || null,
          bank: editBank || null,
          no_rekening: editNoRekening || null,
          account_name: editAccountName || null,
          birthday: editBirthday || null,
          loan_purpose: editLoanPurpose || null,
          monthly_income: editMonthlyIncome ? Number(editMonthlyIncome) : null,
          current_address: editCurrentAddress || null,
          motto: editMotto || null,
          points: editPoints ? Number(editPoints) : undefined,
          consecutive_login_days: editConsecutiveDays ? Number(editConsecutiveDays) : undefined,
          number_of_failures: editNumFailures ? Number(editNumFailures) : undefined,
          ...(editNewPassword ? { new_password: editNewPassword } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.message || "Ralat."); return; }
      setEditRow(null);
      fetchMembers(inputSearch, filterStatus);
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${deleteRow.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteRow(null);
      fetchMembers(inputSearch, filterStatus);
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
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Member List</h1>
          <p style={{ color: "#888", fontSize: 13 }}>Senarai ahli dan maklumat akaun</p>
        </div>
        <button onClick={() => fetchMembers(inputSearch, filterStatus)} style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: 8, padding: "8px 14px", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "inherit" }}>
          <RefreshCw size={13} /> Muat Semula
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#555" }} />
            <input
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              placeholder="Cari nama, IC atau nombor HP..."
              style={{ background: "#111", border: "1px solid #2e2e2e", borderRadius: 8, padding: "8px 12px 8px 30px", color: "#fff", fontSize: 13, outline: "none", width: 240, fontFamily: "inherit" }}
            />
          </div>
          <button type="submit" style={{ background: "#c9a84c", color: "#000", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cari</button>
        </form>

        <div style={{ position: "relative" }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as RegStatus)}
            style={{ background: "#111", border: "1px solid #2e2e2e", borderRadius: 8, padding: "8px 30px 8px 12px", color: "#fff", fontSize: 13, outline: "none", cursor: "pointer", fontFamily: "inherit", appearance: "none" }}
          >
            <option value="all">Semua Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown size={13} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "#666", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e1e1e", background: "#0c0c0c" }}>
                {["UID", "Nama Lengkap", "Score Credit", "Phone Number", "Withdrawal Password", "Balance", "Pending Approval", "Status", "Tindakan"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 44, color: "#555", fontSize: 13 }}>Memuatkan...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 44, color: "#555", fontSize: 13 }}>Tiada ahli dijumpai.</td></tr>
              ) : rows.map((row, i) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #161616", background: i % 2 === 0 ? "transparent" : "#0a0a0a" }}>
                  <td style={{ padding: "13px 16px", color: "#c9a84c", fontWeight: 700, fontFamily: "monospace", fontSize: 13 }}>
                    #{String(row.id).padStart(4, "0")}
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <p style={{ fontSize: 13, color: "#e5e5e5", fontWeight: 600 }}>{row.name}</p>
                    <RegBadge status={row.status} />
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                      {row.credit_score}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "#ccc", fontFamily: "monospace" }}>{row.phone}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "#c9a84c", fontFamily: "monospace", letterSpacing: 2 }}>{row.withdrawal_password || "—"}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "#fff", fontWeight: 600 }}>{formatRM(row.balance)}</td>
                  <td style={{ padding: "13px 16px" }}>
                    {row.pending_loans > 0
                      ? <span style={{ background: "rgba(251,146,60,0.1)", color: "#fb923c", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{row.pending_loans} pending</span>
                      : <span style={{ color: "#444", fontSize: 13 }}>—</span>
                    }
                  </td>
                  <td style={{ padding: "13px 16px" }}><StatusBadge status={row.member_status || "normal"} /></td>
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
        <div style={{ padding: "10px 16px", borderTop: "1px solid #1a1a1a" }}>
          <span style={{ fontSize: 12, color: "#555" }}>{rows.length} ahli</span>
        </div>
      </div>

      {/* ── View Modal ── */}
      {viewRow && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "#111", border: "1px solid #2e2e2e", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "88vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 16px", borderBottom: "1px solid #1e1e1e", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {viewRow.avatar
                  ? <img src={viewRow.avatar} alt="avatar" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid #2e2e2e" }} />
                  : <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1e1e1e", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 16, fontWeight: 700 }}>{viewRow.name.charAt(0).toUpperCase()}</div>
                }
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800 }}>{viewRow.name}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <p style={{ fontSize: 12, color: "#c9a84c", fontFamily: "monospace" }}>#{String(viewRow.id).padStart(4, "0")}</p>
                    <RegBadge status={viewRow.status} />
                  </div>
                </div>
              </div>
              <button onClick={() => setViewRow(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#666", display: "flex" }}><X size={18} /></button>
            </div>

            <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>

                <SectionLabel>Identiti</SectionLabel>
                <FieldBlock label="UID" value={`#${String(viewRow.id).padStart(4, "0")}`} mono />
                <FieldBlock label="Nama Lengkap" value={viewRow.name} />
                <FieldBlock label="Id Card Number" value={viewRow.ic || ""} mono />
                <FieldBlock label="Gender" value={viewRow.gender === "male" ? "Lelaki" : viewRow.gender === "female" ? "Perempuan" : viewRow.gender === "other" ? "Lain-lain" : ""} />
                <FieldBlock label="Birthday" value={formatDate(viewRow.birthday)} />

                <SectionLabel>Hubungi</SectionLabel>
                <FieldBlock label="Phone Number" value={viewRow.phone} mono />
                <FieldBlock label="IP Client" value={viewRow.ip_client || ""} mono />
                <FieldBlock label="Current Address" value={viewRow.current_address || ""} full />

                <SectionLabel>Keselamatan</SectionLabel>
                <div>
                  <p style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Login Password</p>
                  <p style={{ fontSize: 16, color: "#555", letterSpacing: 4 }}>••••••••</p>
                </div>
                <FieldBlock label="Withdrawal Password" value={viewRow.withdrawal_password || ""} mono />

                <SectionLabel>Akaun</SectionLabel>
                <FieldBlock label="Credit Score" value={String(viewRow.credit_score)} />
                <FieldBlock label="Balance" value={formatRM(viewRow.balance)} />
                <FieldBlock label="Points" value={String(viewRow.points ?? 0)} />
                <FieldBlock label="Level" value={String(viewRow.level ?? 1)} />
                <FieldBlock label="Consecutive Login Days" value={String(viewRow.consecutive_login_days ?? 0)} />
                <FieldBlock label="Number of Failures" value={String(viewRow.number_of_failures ?? 0)} />
                <FieldBlock label="Pending Approval" value={viewRow.pending_loans > 0 ? "Pending" : "Approved"} />

                <SectionLabel>Kewangan</SectionLabel>
                <FieldBlock label="Bank" value={viewRow.bank || ""} />
                <FieldBlock label="Nomor Rekening" value={viewRow.no_rekening || ""} mono />
                <FieldBlock label="Nama Pemegang Kad" value={viewRow.account_name || ""} />
                <FieldBlock label="Monthly Income" value={formatRM(viewRow.monthly_income)} />
                <FieldBlock label="Loan Purpose" value={viewRow.loan_purpose || ""} full />

                <SectionLabel>Profil</SectionLabel>
                <FieldBlock label="Motto" value={viewRow.motto || ""} full />
                {viewRow.avatar && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <p style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Avatar</p>
                    <img src={viewRow.avatar} alt="avatar" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", border: "1px solid #2e2e2e" }} />
                  </div>
                )}

                <SectionLabel>Status</SectionLabel>
                <div style={{ gridColumn: "1 / -1" }}>
                  <StatusBadge status={viewRow.member_status || "normal"} />
                </div>
              </div>
            </div>

            <div style={{ padding: "14px 24px", borderTop: "1px solid #1e1e1e", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
              <button onClick={() => { setViewRow(null); openEdit(viewRow); }}
                style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#c9a84c", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                <Edit2 size={13} /> Ubah
              </button>
              <button onClick={() => setViewRow(null)} style={{ background: "#1e1e1e", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, color: "#888", cursor: "pointer", fontFamily: "inherit" }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editRow && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "#111", border: "1px solid #2e2e2e", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px 14px", borderBottom: "1px solid #1e1e1e", flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 800 }}>Edit Ahli</h2>
                <p style={{ fontSize: 12, color: "#555", marginTop: 2 }}>UID #{String(editRow.id).padStart(4, "0")}</p>
              </div>
              <button onClick={() => setEditRow(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#666", display: "flex" }}><X size={18} /></button>
            </div>

            <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px" }}>

                <p style={sectionLabelStyle}>Identiti</p>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Nama Lengkap</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Id Card Number (IC)</label>
                  <input value={editIc} onChange={(e) => setEditIc(e.target.value)} style={{ ...inputStyle, fontFamily: "monospace" }} />
                </div>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select value={editGender} onChange={(e) => setEditGender(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">— Pilih —</option>
                    <option value="male">Lelaki</option>
                    <option value="female">Perempuan</option>
                    <option value="other">Lain-lain</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Birthday</label>
                  <input type="date" value={editBirthday} onChange={(e) => setEditBirthday(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
                </div>

                <p style={sectionLabelStyle}>Keselamatan</p>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Password Baru (kosongkan jika tidak ingin ubah)</label>
                  <input
                    type="password"
                    value={editNewPassword}
                    onChange={(e) => setEditNewPassword(e.target.value)}
                    placeholder="Min. 6 aksara"
                    style={inputStyle}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Withdrawal Password</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={editWithdrawPw} onChange={(e) => setEditWithdrawPw(e.target.value)} style={{ ...inputStyle, fontFamily: "monospace", letterSpacing: 2, flex: 1 }} />
                    <button onClick={generatePassword} title="Generate baru"
                      style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: 8, padding: "0 10px", cursor: "pointer", color: "#888", display: "flex", alignItems: "center", flexShrink: 0 }}>
                      <RefreshCcw size={13} />
                    </button>
                  </div>
                </div>

                <p style={sectionLabelStyle}>Hubungi</p>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} style={{ ...inputStyle, fontFamily: "monospace" }} />
                </div>
                <div>
                  <label style={labelStyle}>IP Client</label>
                  <input value={editIpClient} onChange={(e) => setEditIpClient(e.target.value)} style={{ ...inputStyle, fontFamily: "monospace" }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Current Address</label>
                  <textarea value={editCurrentAddress} onChange={(e) => setEditCurrentAddress(e.target.value)} rows={2}
                    style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} />
                </div>

                <p style={sectionLabelStyle}>Akaun</p>
                <div>
                  <label style={labelStyle}>Credit Score</label>
                  <input type="number" min={0} max={600} value={editCreditScore} onChange={(e) => setEditCreditScore(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Balance (RM)</label>
                  <input type="number" step="0.01" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Points</label>
                  <input type="number" value={editPoints} onChange={(e) => setEditPoints(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Level</label>
                  <input type="number" value={editLevel} onChange={(e) => setEditLevel(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Consecutive Login Days</label>
                  <input type="number" value={editConsecutiveDays} onChange={(e) => setEditConsecutiveDays(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Number of Failures</label>
                  <input type="number" value={editNumFailures} onChange={(e) => setEditNumFailures(e.target.value)} style={inputStyle} />
                </div>

                <p style={sectionLabelStyle}>Kewangan</p>
                <div>
                  <label style={labelStyle}>Bank</label>
                  <input value={editBank} onChange={(e) => setEditBank(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Nomor Rekening</label>
                  <input value={editNoRekening} onChange={(e) => setEditNoRekening(e.target.value)} style={{ ...inputStyle, fontFamily: "monospace" }} />
                </div>
                <div>
                  <label style={labelStyle}>Nama Pemegang Kad</label>
                  <input value={editAccountName} onChange={(e) => setEditAccountName(e.target.value)} placeholder="Nama seperti dalam kad bank" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Monthly Income (RM)</label>
                  <input type="number" step="0.01" value={editMonthlyIncome} onChange={(e) => setEditMonthlyIncome(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Loan Purpose</label>
                  <input value={editLoanPurpose} onChange={(e) => setEditLoanPurpose(e.target.value)} style={inputStyle} />
                </div>

                <p style={sectionLabelStyle}>Profil</p>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Avatar (URL)</label>
                  <input value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} style={inputStyle} placeholder="https://..." />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Motto</label>
                  <input value={editMotto} onChange={(e) => setEditMotto(e.target.value)} style={inputStyle} />
                </div>

                <p style={sectionLabelStyle}>Status</p>
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
                  {(Object.entries(MEMBER_STATUS_META) as [MemberStatus, typeof MEMBER_STATUS_META[MemberStatus]][]).map(([key, m]) => (
                    <label key={key} onClick={() => setEditMemberStatus(key)}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", background: editMemberStatus === key ? "rgba(201,168,76,0.06)" : "#0c0c0c", border: `1px solid ${editMemberStatus === key ? "rgba(201,168,76,0.3)" : "#1e1e1e"}`, borderRadius: 9, cursor: "pointer" }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${editMemberStatus === key ? "#c9a84c" : "#333"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {editMemberStatus === key && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9a84c" }} />}
                      </div>
                      <span style={{ background: m.bg, color: m.color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {editError && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 14 }}>{editError}</p>}
            </div>

            <div style={{ padding: "14px 24px", borderTop: "1px solid #1e1e1e", display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0 }}>
              <button onClick={() => setEditRow(null)} style={{ background: "#1e1e1e", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, color: "#888", cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
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
          <div style={{ background: "#111", border: "1px solid #2e2e2e", borderRadius: 16, padding: 28, width: "100%", maxWidth: 380 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>Padam Ahli</h2>
              <button onClick={() => setDeleteRow(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#666", display: "flex" }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>
              Anda pasti ingin memadam ahli ini? Tindakan ini tidak boleh dibatalkan.
            </p>
            <div style={{ background: "#0c0c0c", borderRadius: 9, padding: "12px 14px", marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: "#e5e5e5", fontWeight: 600 }}>{deleteRow.name}</p>
              <p style={{ fontSize: 12, color: "#666", fontFamily: "monospace", marginTop: 2 }}>{deleteRow.phone}</p>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteRow(null)} style={{ background: "#1e1e1e", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, color: "#888", cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
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

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 10, color: "#c9a84c", fontWeight: 700, letterSpacing: 1.5,
  textTransform: "uppercase", gridColumn: "1 / -1", margin: "4px 0 0",
  paddingBottom: 6, borderBottom: "1px solid #1e1e1e",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, color: "#666", fontWeight: 700, letterSpacing: 1,
  textTransform: "uppercase", display: "block", marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0c0c0c", border: "1px solid #2e2e2e",
  borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13,
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
