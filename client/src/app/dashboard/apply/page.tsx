"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ArrowRight, CheckCircle, Upload, X, PenLine, Trash2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const MIN = 3000, MAX = 200000;
const API = process.env.NEXT_PUBLIC_API_URL!;
const ALL_TERMS = ["6 Bulan","12 Bulan","18 Bulan","24 Bulan","36 Bulan","48 Bulan","60 Bulan","72 Bulan","84 Bulan","96 Bulan","108 Bulan","120 Bulan"];

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg-card)", border: "1px solid var(--border-color)",
  borderRadius: 12, padding: "14px 16px", color: "var(--text-primary)",
  fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </p>
      {children}
    </div>
  );
}

type Step = "form" | "docs" | "profile" | "sign" | "success";
type DocKey = "front_ic" | "back_ic" | "selfie";
interface DocFile { file: File; preview: string }

async function uploadFile(file: File): Promise<string> {
  const token = localStorage.getItem("token");
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Upload gagal."); }
  const data = await res.json();
  return `${API}${data.url}`;
}

function StepBar({ current }: { current: number }) {
  const labels = ["Pinjaman","Dokumen","Maklumat","Tandatangan"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
      {labels.map((_, i) => (
        <div key={i} style={{ width: i === current - 1 ? 24 : 14, height: 4, borderRadius: 2, background: i < current ? "var(--accent-blue)" : "var(--border-color)", transition: "all 0.3s" }} />
      ))}
    </div>
  );
}

export default function ApplyPage() {
  const [step, setStep]   = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingLoan, setExistingLoan] = useState<any>(null);
  const [checkingLoan, setCheckingLoan] = useState(true);

  useEffect(() => {
    apiFetch("/loans/my")
      .then((loans: any[]) => { if (Array.isArray(loans) && loans.length > 0) setExistingLoan(loans[0]); })
      .catch(() => {})
      .finally(() => setCheckingLoan(false));
  }, []);

  /* Step 1 */
  const [amount, setAmount]     = useState(3000);
  const [inputText, setInputText] = useState("3000");
  const [loanTerms, setLoanTerms] = useState("");
  const [bank, setBank]         = useState("");
  const [noRek, setNoRek]       = useState("");
  const [accountName, setAccountName] = useState("");

  /* Step 2 */
  const [docs, setDocs] = useState<Partial<Record<DocKey, DocFile>>>({});
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef  = useRef<HTMLInputElement>(null);
  const selfRef  = useRef<HTMLInputElement>(null);

  /* Step 3 */
  const [profile, setProfile] = useState({
    name: "", ic: "", gender: "" as "" | "male" | "female" | "other",
    birthday: "", occupation: "", monthly_income: "",
    loan_purpose: "", current_address: "",
    emergency_name: "", emergency_phone: "",
  });

  /* Step 4 */
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing]   = useState(false);
  const [hasSig, setHasSig]     = useState(false);
  const lastPos = useRef<{x:number;y:number} | null>(null);

  /* Autofill profile from API */
  useEffect(() => {
    if (step === "profile") {
      apiFetch("/auth/me").then((u) => {
        setProfile((p) => ({
          ...p,
          name: u.name || p.name,
          ic:   u.ic   || p.ic,
          gender:         u.gender   || p.gender,
          birthday:       u.birthday ? formatDateDisplay(u.birthday) : p.birthday,
          occupation:     u.occupation    || p.occupation,
          monthly_income: u.monthly_income ? String(u.monthly_income) : p.monthly_income,
          loan_purpose:   u.loan_purpose  || p.loan_purpose,
          current_address: u.current_address || p.current_address,
        }));
      }).catch(() => {
        setProfile((p) => ({ ...p, name: localStorage.getItem("user_name") || p.name }));
      });
    }
  }, [step]);

  function formatDateDisplay(raw: string) {
    if (!raw) return "";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    const dd = String(d.getDate()).padStart(2,"0");
    const mm = String(d.getMonth()+1).padStart(2,"0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  const setP = (k: keyof typeof profile, v: string) => setProfile((p) => ({ ...p, [k]: v }));
  const availableTerms = amount < 5000 ? ALL_TERMS.slice(0,5) : ALL_TERMS;
  const sliderPct = ((amount - MIN) / (MAX - MIN)) * 100;

  useEffect(() => {
    if (loanTerms && !availableTerms.includes(loanTerms)) setLoanTerms("");
  }, [amount]);

  /* Docs helpers */
  const pickFile = (key: DocKey, file: File | undefined) => {
    if (!file) return;
    setDocs((p) => ({ ...p, [key]: { file, preview: URL.createObjectURL(file) } }));
  };
  const removeDoc = (key: DocKey) => {
    if (docs[key]) URL.revokeObjectURL(docs[key]!.preview);
    setDocs((p) => { const n = { ...p }; delete n[key]; return n; });
  };

  /* Canvas helpers */
  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const r = canvas.getBoundingClientRect();
    const src = "touches" in e ? e.touches[0] : e;
    return { x: (src.clientX - r.left) * (canvas.width / r.width), y: (src.clientY - r.top) * (canvas.height / r.height) };
  };
  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    const pos = getCanvasPos(e, canvas);
    lastPos.current = pos;
    setDrawing(true);
  };
  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing || !lastPos.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pos = getCanvasPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#c9a84c";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
    setHasSig(true);
  }, [drawing]);
  const endDraw = () => { setDrawing(false); lastPos.current = null; };
  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
  };
  const getSignatureFile = (): Promise<File> => new Promise((resolve, reject) => {
    const canvas = canvasRef.current; if (!canvas) { reject(new Error("Canvas not found")); return; }
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error("Gagal mendapatkan tandatangan.")); return; }
      resolve(new File([blob], "signature.png", { type: "image/png" }));
    }, "image/png");
  });

  /* Navigation */
  const goForm = () => { setError(""); setStep("form"); };
  const goDocs = () => {
    setError("");
    if (!loanTerms) { setError("Sila pilih tempoh pinjaman."); return; }
    if (amount < MIN || amount > MAX) { setError(`Jumlah mestilah antara RM ${MIN.toLocaleString()} dan RM ${MAX.toLocaleString()}.`); return; }
    setStep("docs");
  };
  const goProfile = () => {
    setError("");
    if (!docs.front_ic || !docs.back_ic || !docs.selfie) {
      setError("Sila muat naik semua dokumen yang diperlukan (Hadapan IC, Belakang IC, dan Selfie)."); return;
    }
    setStep("profile");
  };
  const goSign = () => {
    setError("");
    const { name, ic, gender, birthday, occupation, monthly_income, loan_purpose, current_address, emergency_name, emergency_phone } = profile;
    if (!name || !ic || !gender || !birthday || !occupation || !monthly_income || !loan_purpose || !current_address || !emergency_name || !emergency_phone) {
      setError("Sila lengkapkan semua maklumat yang diperlukan."); return;
    }
    setStep("sign");
  };
  const handleSubmit = async () => {
    setError("");
    if (!hasSig) { setError("Sila buat tandatangan anda di atas."); return; }
    setLoading(true);
    try {
      const sigFile = await getSignatureFile();
      const [front_ic_url, back_ic_url, selfie_url, sign_url] = await Promise.all([
        uploadFile(docs.front_ic!.file),
        uploadFile(docs.back_ic!.file),
        uploadFile(docs.selfie!.file),
        uploadFile(sigFile),
      ]);
      await apiFetch("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: profile.name, ic: profile.ic, gender: profile.gender,
          birthday: profile.birthday, occupation: profile.occupation,
          monthly_income: parseFloat(profile.monthly_income) || null,
          loan_purpose: profile.loan_purpose, current_address: profile.current_address,
        }),
      });
      await apiFetch("/loans/apply", {
        method: "POST",
        body: JSON.stringify({
          amount, loan_terms: loanTerms, bank: bank || undefined, no_rekening: noRek || undefined, account_name: accountName || undefined,
          front_ic_url, back_ic_url, selfie_url, sign_url,
          emergency_name: profile.emergency_name, emergency_phone: profile.emergency_phone,
        }),
      });
      setStep("success");
    } catch (e: any) {
      setError(e.message || "Ralat tidak diketahui.");
    } finally {
      setLoading(false);
    }
  };

  const statusLabel: Record<string, string> = {
    under_review: "Sedang Semakan", loan_approved: "Diluluskan",
    credit_frozen: "Kredit Dibekukan", unfrozen_processing: "Proses Pencairan",
    credit_score_low: "Skor Kredit Rendah", payment_processing: "Proses Pembayaran",
    loan_being_canceled: "Dalam Pembatalan",
  };

  /* ─── LOADING CHECK ─── */
  if (checkingLoan) return (
    <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
      Memeriksa status pinjaman...
    </div>
  );

  /* ─── ALREADY HAS LOAN ─── */
  if (existingLoan) return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 16px" }}>
        <Link href="/dashboard">
          <button style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }}>
            <ChevronLeft size={18} />
          </button>
        </Link>
        <p style={{ fontSize: 18, fontWeight: 800 }}>Mohon Pinjaman</p>
      </div>
      <div style={{ padding: "20px 20px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, animation: "fadeInUp 0.4s ease both" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
          📋
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Anda Sudah Ada Permohonan</p>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Anda tidak boleh membuat permohonan baru selagi permohonan sebelumnya masih aktif.
          </p>
        </div>
        <div className="card" style={{ width: "100%", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Jumlah</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>RM {Number(existingLoan.amount).toLocaleString("ms-MY")}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Tempoh</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{existingLoan.loan_terms || "—"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Status</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#c9a84c", background: "rgba(201,168,76,0.12)", borderRadius: 6, padding: "2px 8px" }}>
              {statusLabel[existingLoan.status] ?? existingLoan.status}
            </span>
          </div>
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/dashboard/wallet" style={{ width: "100%" }}>
            <button style={{ width: "100%", background: "var(--accent-blue)", border: "none", borderRadius: 14, padding: 16, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Lihat Status di Dompet
            </button>
          </Link>
          <Link href="/dashboard/support" style={{ width: "100%" }}>
            <button style={{ width: "100%", background: "transparent", border: "1.5px solid var(--border-light)", borderRadius: 14, padding: 16, color: "var(--text-secondary)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Hubungi Khidmat Pelanggan
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  /* ─── SUCCESS ─── */
  if (step === "success") return (
    <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, animation: "fadeInUp 0.4s ease both" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CheckCircle size={40} color="#22c55e" />
      </div>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Permohonan Dihantar!</h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          Permohonan pinjaman anda sedang disemak oleh pasukan kami.<br />Kami akan maklumkan status dalam 1–3 hari bekerja.
        </p>
      </div>
      <div className="card" style={{ width: "100%", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Jumlah Pinjaman</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>RM {amount.toLocaleString("ms-MY")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Tempoh</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{loanTerms}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
        <Link href="/dashboard/wallet">
          <button style={{ width: "100%", background: "var(--accent-blue)", border: "none", borderRadius: 14, padding: 16, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Lihat Status Pinjaman</button>
        </Link>
        <Link href="/dashboard">
          <button style={{ width: "100%", background: "transparent", border: "1.5px solid var(--border-light)", borderRadius: 14, padding: 16, color: "var(--text-secondary)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Kembali ke Dashboard</button>
        </Link>
      </div>
    </div>
  );

  /* ─── SIGN ─── */
  if (step === "sign") return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 16px", animation: "fadeInUp 0.4s ease both" }}>
        <button onClick={() => setStep("profile")} style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }}>
          <ChevronLeft size={18} />
        </button>
        <div><p style={{ fontSize: 18, fontWeight: 800 }}>Tandatangan</p><p style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--text-secondary)", textTransform: "uppercase" }}>Langkah 4 / 4</p></div>
        <StepBar current={4} />
      </div>

      <div style={{ padding: "0 20px 16px" }}>
        <div className="card" style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", display: "flex", justifyContent: "space-between" }}>
          <div><p style={{ fontSize: 11, color: "var(--text-secondary)" }}>Jumlah</p><p style={{ fontSize: 17, fontWeight: 800 }}>RM {amount.toLocaleString("ms-MY")}</p></div>
          <div style={{ textAlign: "right" }}><p style={{ fontSize: 11, color: "var(--text-secondary)" }}>Tempoh</p><p style={{ fontSize: 15, fontWeight: 700 }}>{loanTerms}</p></div>
        </div>
      </div>

      <div style={{ padding: "0 20px", animation: "fadeInUp 0.4s ease 0.1s both" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>
            <PenLine size={13} style={{ marginRight: 6, verticalAlign: "middle" }} />Tandatangan Virtual
          </p>
          {hasSig && (
            <button onClick={clearCanvas} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <Trash2 size={13} /> Padam
            </button>
          )}
        </div>

        <div style={{ border: "1.5px dashed var(--border-light)", borderRadius: 16, overflow: "hidden", background: "var(--bg-card)", position: "relative", touchAction: "none" }}>
          {!hasSig && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)", letterSpacing: 1 }}>Gores tandatangan anda di sini</p>
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={800}
            height={240}
            style={{ width: "100%", height: 160, display: "block", cursor: "crosshair", touchAction: "none" }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
        </div>

        <div style={{ height: 1, background: "var(--border-color)", margin: "0 16px 12px", opacity: 0.5 }} />
        <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginBottom: 20, lineHeight: 1.5 }}>
          Tandatangan ini merupakan persetujuan sah anda terhadap terma pinjaman.
        </p>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
            <p style={{ fontSize: 13, color: "#ef4444" }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", background: loading ? "var(--bg-card-inner)" : "var(--accent-blue)", border: "none", borderRadius: 14, padding: 16, color: loading ? "var(--text-muted)" : "white", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}
        >
          {loading ? "Menghantar semua data..." : (<>Hantar Permohonan <ArrowRight size={18} /></>)}
        </button>
      </div>
    </div>
  );

  /* ─── PROFILE ─── */
  if (step === "profile") {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 16px", animation: "fadeInUp 0.4s ease both" }}>
          <button onClick={() => setStep("docs")} style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }}>
            <ChevronLeft size={18} />
          </button>
          <div><p style={{ fontSize: 18, fontWeight: 800 }}>Maklumat Pribadi</p><p style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--text-secondary)", textTransform: "uppercase" }}>Langkah 3 / 4</p></div>
          <StepBar current={3} />
        </div>

        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16, animation: "fadeInUp 0.4s ease 0.1s both" }}>
          <Field label="Nama Penuh" required>
            <input type="text" value={profile.name} onChange={(e) => setP("name", e.target.value)} placeholder="Nama penuh seperti dalam IC" style={inputStyle} />
          </Field>

          <Field label="No. Kad Pengenalan" required>
            <input type="text" value={profile.ic} onChange={(e) => setP("ic", e.target.value)} placeholder="cth: 901231-01-1234" style={inputStyle} />
          </Field>

          <Field label="Jantina" required>
            <div style={{ display: "flex", gap: 10 }}>
              {[{v:"male",l:"Lelaki"},{v:"female",l:"Perempuan"},{v:"other",l:"Lain-lain"}].map(({v,l}) => (
                <button key={v} onClick={() => setP("gender", v)} style={{ flex: 1, background: profile.gender === v ? "var(--accent-blue)" : "var(--bg-card)", border: `1px solid ${profile.gender === v ? "var(--accent-blue)" : "var(--border-color)"}`, borderRadius: 10, padding: "12px 4px", color: profile.gender === v ? "white" : "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
              ))}
            </div>
          </Field>

          <Field label="Tarikh Lahir" required>
            <input type="text" value={profile.birthday} onChange={(e) => setP("birthday", e.target.value)} placeholder="cth: 31/01/1990" style={inputStyle} />
          </Field>

          <Field label="Pekerjaan Semasa" required>
            <input type="text" value={profile.occupation} onChange={(e) => setP("occupation", e.target.value)} placeholder="cth: Guru, Jurutera, Kerajaan..." style={inputStyle} />
          </Field>

          <Field label="Pendapatan Bulanan (RM)" required>
            <input type="number" value={profile.monthly_income} onChange={(e) => setP("monthly_income", e.target.value)} placeholder="cth: 3500" style={inputStyle} />
          </Field>

          <Field label="Tujuan Pinjaman" required>
            <input type="text" value={profile.loan_purpose} onChange={(e) => setP("loan_purpose", e.target.value)} placeholder="cth: Pendidikan, Perubatan, Perniagaan..." style={inputStyle} />
          </Field>

          <Field label="Alamat Semasa" required>
            <textarea value={profile.current_address} onChange={(e) => setP("current_address", e.target.value)} placeholder="No. rumah, jalan, bandar, negeri" rows={3} style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }} />
          </Field>

          <div style={{ height: 1, background: "var(--border-color)" }} />
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-blue-light)", letterSpacing: 1, textTransform: "uppercase" }}>Kenalan Kecemasan</p>

          <Field label="Nama Kontak Kecemasan" required>
            <input type="text" value={profile.emergency_name} onChange={(e) => setP("emergency_name", e.target.value)} placeholder="Nama ahli keluarga atau kenalan" style={inputStyle} />
          </Field>

          <Field label="Nombor Kontak Kecemasan" required>
            <input type="tel" value={profile.emergency_phone} onChange={(e) => setP("emergency_phone", e.target.value)} placeholder="cth: 0123456789" style={inputStyle} />
          </Field>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ fontSize: 13, color: "#ef4444" }}>{error}</p>
            </div>
          )}

          <button onClick={goSign} style={{ width: "100%", background: "var(--accent-blue)", border: "none", borderRadius: 14, padding: 16, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            Seterusnya — Tandatangan <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  /* ─── DOCS ─── */
  if (step === "docs") {
    const docFields: { key: DocKey; label: string; hint: string; ref: React.RefObject<HTMLInputElement | null> }[] = [
      { key: "front_ic", label: "Hadapan IC",  hint: "Pastikan nombor IC jelas kelihatan",             ref: frontRef },
      { key: "back_ic",  label: "Belakang IC", hint: "Bahagian belakang kad pengenalan",               ref: backRef  },
      { key: "selfie",   label: "Selfie",       hint: "Foto muka yang jelas dengan pencahayaan baik",  ref: selfRef  },
    ];
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 16px", animation: "fadeInUp 0.4s ease both" }}>
          <button onClick={goForm} style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }}>
            <ChevronLeft size={18} />
          </button>
          <div><p style={{ fontSize: 18, fontWeight: 800 }}>Dokumen</p><p style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--text-secondary)", textTransform: "uppercase" }}>Langkah 2 / 4</p></div>
          <StepBar current={2} />
        </div>

        <div style={{ padding: "0 20px 16px" }}>
          <div className="card" style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", display: "flex", justifyContent: "space-between" }}>
            <div><p style={{ fontSize: 11, color: "var(--text-secondary)" }}>Jumlah</p><p style={{ fontSize: 17, fontWeight: 800 }}>RM {amount.toLocaleString("ms-MY")}</p></div>
            <div style={{ textAlign: "right" }}><p style={{ fontSize: 11, color: "var(--text-secondary)" }}>Tempoh</p><p style={{ fontSize: 15, fontWeight: 700 }}>{loanTerms}</p></div>
          </div>
        </div>

        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14, animation: "fadeInUp 0.4s ease 0.1s both" }}>
          {docFields.map(({ key, label, hint, ref }) => {
            const doc = docs[key];
            return (
              <div key={key}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{label} <span style={{ color: "#ef4444" }}>*</span></p>
                <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => pickFile(key, e.target.files?.[0])} />
                {doc ? (
                  <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid var(--border-color)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={doc.preview} alt={label} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                    <button onClick={() => removeDoc(key)} style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <X size={14} color="white" />
                    </button>
                    <div style={{ padding: "8px 12px", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle size={13} color="#22c55e" /><span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>{doc.file.name}</span>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => ref.current?.click()} style={{ width: "100%", background: "var(--bg-card)", border: "1.5px dashed var(--border-light)", borderRadius: 14, padding: "24px 16px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontFamily: "inherit" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Upload size={20} color="var(--accent-blue-light)" />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>Klik untuk muat naik</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{hint}</p>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>JPG, PNG, HEIC · Maks 5MB</p>
                    </div>
                  </button>
                )}
              </div>
            );
          })}

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ fontSize: 13, color: "#ef4444" }}>{error}</p>
            </div>
          )}

          <button onClick={goProfile} style={{ width: "100%", background: "var(--accent-blue)", border: "none", borderRadius: 14, padding: 16, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            Seterusnya — Maklumat Pribadi <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  /* ─── FORM (Step 1) ─── */
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 16px", animation: "fadeInUp 0.4s ease both" }}>
        <Link href="/dashboard">
          <button style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }}>
            <ChevronLeft size={18} />
          </button>
        </Link>
        <div><p style={{ fontSize: 18, fontWeight: 800 }}>Mohon Pinjaman</p><p style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--text-secondary)", textTransform: "uppercase" }}>Langkah 1 / 4</p></div>
        <StepBar current={1} />
      </div>

      <div style={{ padding: "0 20px 20px", animation: "fadeInUp 0.4s ease 0.05s both" }}>
        <div className="card" style={{ background: "linear-gradient(135deg, var(--bg-card-inner) 0%, var(--bg-primary) 100%)", border: "1px solid var(--border-light)" }}>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>LIMIT TERSEDIA</p>
          <p style={{ fontSize: 22, fontWeight: 900 }}>RM 3,000 — RM 200,000</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>Tempoh bayaran sehingga {amount < 5000 ? "36" : "120"} bulan</p>
        </div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 20, animation: "fadeInUp 0.4s ease 0.1s both" }}>

        {/* Slider Card */}
        <div className="card" style={{ padding: "20px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>Jumlah Pinjaman <span style={{ color: "#ef4444" }}>*</span></p>
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>min RM 3,000 · maks RM 200,000</p>
          </div>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>JUMLAH DIPILIH</p>
            <p style={{ fontSize: 34, fontWeight: 900, color: "var(--accent-blue-light)", letterSpacing: -1 }}>RM {amount.toLocaleString("ms-MY")}</p>
          </div>
          <div style={{ marginBottom: 14 }}>
            <style>{`.loan-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer;background:linear-gradient(to right,var(--accent-blue) 0%,var(--accent-blue) ${sliderPct}%,#2a2a2a ${sliderPct}%,#2a2a2a 100%)}.loan-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:22px;height:22px;border-radius:50%;background:var(--accent-blue);border:3px solid #0a0a0a;box-shadow:0 0 8px rgba(201,168,76,0.5);cursor:grab}.loan-slider::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:var(--accent-blue);border:3px solid #0a0a0a;cursor:grab}`}</style>
            <input type="range" className="loan-slider" min={MIN} max={MAX} step={500} value={amount} onChange={(e) => { const v = parseInt(e.target.value); setAmount(v); setInputText(String(v)); }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>RM 3,000</span>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>RM 200,000</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", flexShrink: 0 }}>RM</span>
            <input type="number" value={inputText} onChange={(e) => { setInputText(e.target.value); const n = parseInt(e.target.value); if (!isNaN(n)) setAmount(Math.min(Math.max(n, MIN), MAX)); }} onBlur={() => { const c = Math.min(Math.max(amount, MIN), MAX); setAmount(c); setInputText(String(c)); }} style={{ flex: 1, background: "var(--bg-card-inner)", border: "1px solid var(--border-color)", borderRadius: 10, padding: "10px 12px", color: "var(--text-primary)", fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        {/* Terms */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>Tempoh Pinjaman <span style={{ color: "#ef4444" }}>*</span></p>
            <span style={{ fontSize: 10, color: "var(--accent-blue-light)", fontWeight: 600, background: "rgba(201,168,76,0.1)", borderRadius: 6, padding: "2px 8px" }}>Maks {amount < 5000 ? "36" : "120"} Bulan</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {availableTerms.map((t) => (
              <button key={t} onClick={() => setLoanTerms(t)} style={{ background: loanTerms === t ? "var(--accent-blue)" : "var(--bg-card)", border: `1px solid ${loanTerms === t ? "var(--accent-blue)" : "var(--border-color)"}`, borderRadius: 10, padding: "10px 4px", color: loanTerms === t ? "white" : "var(--text-secondary)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Bank */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Bank Pengeluaran</p>
          <input type="text" placeholder="cth: Maybank, CIMB Bank..." value={bank} onChange={(e) => setBank(e.target.value)} style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "14px 16px", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Account */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Nombor Akaun Bank</p>
          <input type="text" placeholder="cth: 1234567890" value={noRek} onChange={(e) => setNoRek(e.target.value)} style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "14px 16px", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Account Name */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Nama Pemegang Kad</p>
          <input type="text" placeholder="Nama seperti dalam kad bank" value={accountName} onChange={(e) => setAccountName(e.target.value)} style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "14px 16px", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 14px" }}>
            <p style={{ fontSize: 13, color: "#ef4444" }}>{error}</p>
          </div>
        )}

        <button onClick={goDocs} style={{ width: "100%", background: "var(--accent-blue)", border: "none", borderRadius: 14, padding: 16, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          Seterusnya — Muat Naik Dokumen <ArrowRight size={18} />
        </button>
        <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5, marginBottom: 16 }}>
          4 langkah mudah: Pinjaman → Dokumen → Maklumat → Tandatangan
        </p>
      </div>
    </div>
  );
}
