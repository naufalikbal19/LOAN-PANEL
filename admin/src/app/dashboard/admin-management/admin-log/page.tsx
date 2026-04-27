"use client";
import { useEffect, useState } from "react";
import { Search, RefreshCw, ShieldCheck, Settings, UserCheck, UserX, Trash2, LogIn, Pencil } from "lucide-react";

interface LogEntry {
  id: number;
  admin_id: number;
  admin_name: string;
  action: string;
  target: string;
  ip_address: string;
  created_at: string;
}

const ACTION_ICON: Record<string, React.ElementType> = {
  "Log masuk":        LogIn,
  "Luluskan ahli":    UserCheck,
  "Tolak ahli":       UserX,
  "Padam ahli":       Trash2,
  "Kemaskini ahli":   Pencil,
  "Kemaskini tetapan": Settings,
};

const ACTION_COLOR: Record<string, string> = {
  "Log masuk":        "#c9a84c",
  "Luluskan ahli":    "#22c55e",
  "Tolak ahli":       "#ef4444",
  "Padam ahli":       "#ef4444",
  "Kemaskini ahli":   "#818cf8",
  "Kemaskini tetapan": "#888",
};

function ActionIcon({ action }: { action: string }) {
  const Icon = ACTION_ICON[action] ?? ShieldCheck;
  const color = ACTION_COLOR[action] ?? "#888";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 8, background: `${color}18` }}>
      <Icon size={13} color={color} />
    </span>
  );
}

export default function AdminLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [inputSearch, setInputSearch] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const fetchLogs = async (q = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (q) params.set("search", q);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(inputSearch);
    fetchLogs(inputSearch);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("ms-MY", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Admin Log</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Semua aktiviti dan tindakan yang dilakukan oleh admin</p>
        </div>
        <button onClick={() => fetchLogs(search)} style={{ background: "var(--bg-card-inner)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "8px 14px", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "inherit" }}>
          <RefreshCw size={13} /> Muat Semula
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              placeholder="Cari admin, tindakan atau sasaran..."
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "9px 12px 9px 32px", color: "var(--text-primary)", fontSize: 13, outline: "none", width: 280, fontFamily: "inherit" }}
            />
          </div>
          <button type="submit" style={{ background: "#c9a84c", color: "#000", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Cari
          </button>
        </form>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--nav-bg)" }}>
                {["#", "Admin", "Tindakan", "Sasaran", "IP Address", "Masa"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Memuatkan log...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Tiada rekod log dijumpai.</td></tr>
              ) : logs.map((log, i) => (
                <tr key={log.id} style={{ borderTop: "1px solid var(--border-color)", background: i % 2 === 0 ? "transparent" : "var(--bg-card-inner)" }}>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 11 }}>{log.id}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontWeight: 700, color: "#c9a84c" }}>{log.admin_name}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ActionIcon action={log.action} />
                      <span style={{ color: "var(--text-primary)" }}>{log.action}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: 12 }}>{log.target}</td>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontFamily: "monospace", fontSize: 12 }}>{log.ip_address}</td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)", whiteSpace: "nowrap", fontSize: 12 }}>{formatDate(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "10px 16px", borderTop: "1px solid var(--bg-card)" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Menunjukkan {logs.length} rekod terkini</span>
        </div>
      </div>
    </div>
  );
}
