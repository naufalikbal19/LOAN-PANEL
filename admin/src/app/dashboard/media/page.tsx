"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Upload, Copy, Trash2, Check, RefreshCw, ImageIcon } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL!;

interface Asset {
  filename: string;
  url: string;
  size: number;
  created_at: string;
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("ms-MY", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function MediaPage() {
  const [assets, setAssets]         = useState<Asset[]>([]);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const [dragOver, setDragOver]     = useState(false);
  const [copiedUrl, setCopiedUrl]   = useState<string | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";
  const adminRole = typeof window !== "undefined" ? localStorage.getItem("admin_role") : "";

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/upload/list`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch { setAssets([]); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { showToast("Hanya fail imej dibenarkan.", false); return; }
    if (file.size > 5 * 1024 * 1024) { showToast("Saiz fail melebihi 5 MB.", false); return; }
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      const res = await fetch(`${API}/upload`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || "Gagal muat naik.", false); return; }
      showToast("Berjaya dimuat naik!");
      fetchAssets();
    } catch { showToast("Ralat sambungan.", false); }
    finally { setUploading(false); }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const copyUrl = (url: string) => {
    const full = `${API}${url}`;
    navigator.clipboard.writeText(full).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  };

  const handleDelete = async (filename: string) => {
    try {
      const res = await fetch(`${API}/upload/${encodeURIComponent(filename)}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || "Gagal memadam.", false); return; }
      showToast("Fail dipadam.");
      setAssets((p) => p.filter((a) => a.filename !== filename));
    } catch { showToast("Ralat sambungan.", false); }
    finally { setDeleteId(null); }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200, background: toast.ok ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${toast.ok ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 10, padding: "12px 18px", color: toast.ok ? "#22c55e" : "#ef4444", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          {toast.ok ? <Check size={15} /> : "⚠"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Media</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Muat naik dan urus aset gambar. Salin URL untuk digunakan di Settings.</p>
        </div>
        <button onClick={fetchAssets} style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "8px 14px", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "inherit" }}>
          <RefreshCw size={13} /> Muat Semula
        </button>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "#c9a84c" : "var(--border-light)"}`,
          borderRadius: 16,
          padding: "40px 24px",
          textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          background: dragOver ? "rgba(201,168,76,0.05)" : "var(--bg-card)",
          transition: "all 0.2s",
          marginBottom: 28,
        }}
      >
        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <Upload size={22} color="#c9a84c" />
        </div>
        {uploading ? (
          <p style={{ fontSize: 14, fontWeight: 700, color: "#c9a84c" }}>Memuat naik...</p>
        ) : (
          <>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Seret & lepas imej di sini, atau klik untuk pilih fail</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>PNG, JPG, SVG, GIF, WebP — maks 5 MB setiap fail</p>
          </>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)", fontSize: 13 }}>Memuatkan aset...</div>
      ) : assets.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <ImageIcon size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 13 }}>Belum ada aset dimuat naik.</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>{assets.length} fail</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
            {assets.map((a) => (
              <div key={a.filename} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {/* Thumbnail */}
                <div style={{ height: 130, background: "var(--bg-card-inner)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${API}${a.url}`}
                    alt={a.filename}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <ImageIcon size={28} color="var(--text-muted)" style={{ position: "absolute", opacity: 0.3 }} />
                </div>

                {/* Info */}
                <div style={{ padding: "10px 10px 8px" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={a.filename}>{a.filename}</p>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 8 }}>{fmtSize(a.size)} · {fmtDate(a.created_at)}</p>

                  {/* URL bar */}
                  <div style={{ background: "var(--bg-card-inner)", borderRadius: 7, padding: "6px 8px", fontSize: 10, color: "var(--text-secondary)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 8, border: "1px solid var(--border-color)" }} title={`${API}${a.url}`}>
                    {`${API}${a.url}`}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => copyUrl(a.url)}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: copiedUrl === a.url ? "rgba(34,197,94,0.12)" : "rgba(201,168,76,0.1)", border: "none", borderRadius: 7, padding: "7px 0", fontSize: 11, fontWeight: 700, cursor: "pointer", color: copiedUrl === a.url ? "#22c55e" : "#c9a84c", fontFamily: "inherit", transition: "all 0.2s" }}
                    >
                      {copiedUrl === a.url ? <><Check size={11} /> Disalin</> : <><Copy size={11} /> Salin URL</>}
                    </button>
                    {adminRole === "admin" && (
                      <button
                        onClick={() => setDeleteId(a.filename)}
                        style={{ background: "rgba(239,68,68,0.08)", border: "none", borderRadius: 7, padding: "7px 9px", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center" }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 340, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, background: "rgba(239,68,68,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={22} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Padam Fail?</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 6, wordBreak: "break-all" }}>{deleteId}</p>
            <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 24 }}>Fail yang dipadam tidak boleh dipulihkan. Pastikan tiada halaman yang menggunakan URL ini.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, background: "var(--bg-card-inner)", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, background: "#ef4444", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#fff", fontFamily: "inherit" }}>Ya, Padam</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
