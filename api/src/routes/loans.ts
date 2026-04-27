import { Router, Request, Response } from "express";
import { pool } from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { logAction } from "../middleware/logger";

const router = Router();
const adminOrStaff = [requireAuth, requireRole("admin", "staff")];

const VALID_STATUSES = [
  "under_review", "loan_approved", "credit_frozen",
  "unfrozen_processing", "credit_score_low", "payment_processing", "loan_being_canceled",
  "transfer_failed",
];

// GET /loans/stats — summary stats for admin console
router.get("/stats", ...adminOrStaff, async (_req: Request, res: Response) => {
  try {
    const [[totals]] = await pool.query<any[]>(
      `SELECT COUNT(*) as total_count, COALESCE(SUM(amount),0) as total_amount FROM loans`
    );
    const [[problem]] = await pool.query<any[]>(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount),0) as amount FROM loans WHERE status IN ('credit_frozen','credit_score_low')`
    );
    const [[inprocess]] = await pool.query<any[]>(
      `SELECT COUNT(*) as count FROM loans WHERE status IN ('under_review','unfrozen_processing','payment_processing')`
    );
    const [[approved]] = await pool.query<any[]>(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount),0) as amount FROM loans WHERE status = 'loan_approved'`
    );
    const [recent] = await pool.query<any[]>(
      `SELECT l.id, u.name, l.amount, l.status, l.created_at
       FROM loans l INNER JOIN users u ON u.id = l.user_id
       ORDER BY l.created_at DESC LIMIT 5`
    );
    res.json({ totals, problem, inprocess, approved, recent });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// GET /loans/my/history — client sees full status history
router.get("/my/history", requireAuth, requireRole("client"), async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<any[]>(
      `SELECT lsh.id, lsh.loan_id, lsh.status, lsh.keterangan, lsh.created_at, l.amount, l.loan_terms
       FROM loan_status_history lsh
       INNER JOIN loans l ON l.id = lsh.loan_id
       WHERE lsh.user_id = ?
       ORDER BY lsh.created_at DESC`,
      [req.user!.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// GET /loans/my — client sees own loans
router.get("/my", requireAuth, requireRole("client"), async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<any[]>(
      `SELECT id, amount, loan_terms, bank, no_rekening, account_name, keterangan, status,
              front_ic_url, back_ic_url, selfie_url, sign_url,
              emergency_name, emergency_phone, created_at, updated_at
       FROM loans WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user!.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// POST /loans/apply — client submits loan application
router.post("/apply", requireAuth, requireRole("client"), async (req: Request, res: Response) => {
  try {
    const { amount, loan_terms, bank, no_rekening, account_name, front_ic_url, back_ic_url, selfie_url, sign_url, emergency_name, emergency_phone } = req.body;
    if (!amount || !loan_terms) {
      res.status(400).json({ message: "Jumlah dan tempoh pinjaman wajib diisi." }); return;
    }
    // Semak jika sudah ada pinjaman aktif
    const [existing] = await pool.query<any[]>(
      "SELECT id FROM loans WHERE user_id = ? LIMIT 1",
      [req.user!.id]
    );
    if ((existing as any[]).length > 0) {
      res.status(409).json({ message: "Anda sudah mempunyai permohonan pinjaman. Sila hubungi khidmat pelanggan untuk maklumat lanjut.", code: "LOAN_EXISTS" }); return;
    }
    const [result] = await pool.query<any>(
      `INSERT INTO loans (user_id, amount, loan_terms, bank, no_rekening, account_name, front_ic_url, back_ic_url, selfie_url, sign_url, emergency_name, emergency_phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'under_review')`,
      [req.user!.id, amount, loan_terms, bank || null, no_rekening || null, account_name || null, front_ic_url || null, back_ic_url || null, selfie_url || null, sign_url || null, emergency_name || null, emergency_phone || null]
    );
    // Update balance = loan amount, and bank info if provided
    await pool.query(
      `UPDATE users SET balance = ?, bank = COALESCE(?, bank), no_rekening = COALESCE(?, no_rekening), account_name = COALESCE(?, account_name) WHERE id = ?`,
      [amount, bank || null, no_rekening || null, account_name || null, req.user!.id]
    );
    // Rekod status awal dalam history
    await pool.query(
      "INSERT INTO loan_status_history (loan_id, user_id, status) VALUES (?, ?, 'under_review')",
      [(result as any).insertId, req.user!.id]
    );
    res.status(201).json({ message: "Permohonan pinjaman anda telah dihantar.", id: (result as any).insertId });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// GET /loans — list all loans joined with user info
router.get("/", ...adminOrStaff, async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT l.id, l.user_id, u.name, u.phone, u.ic, l.amount, l.loan_terms,
             l.bank, l.no_rekening, l.account_name, l.sign_url, l.front_ic_url, l.back_ic_url, l.selfie_url, l.keterangan, l.status, l.created_at, l.updated_at
      FROM loans l
      INNER JOIN users u ON u.id = l.user_id
      WHERE u.role = 'client'
    `;
    const params: any[] = [];

    if (status && status !== "all") {
      query += " AND l.status = ?";
      params.push(status);
    }
    if (search) {
      query += " AND (u.phone LIKE ? OR u.name LIKE ? OR CAST(l.user_id AS CHAR) LIKE ? OR CAST(l.id AS CHAR) LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }

    query += " ORDER BY l.created_at DESC";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// GET /loans/:id — single loan detail
router.get("/:id", ...adminOrStaff, async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<any[]>(
      `SELECT l.id, l.user_id, u.name, u.phone, u.ic, l.amount, l.loan_terms,
              l.bank, l.no_rekening, l.account_name, l.sign_url, l.front_ic_url, l.back_ic_url, l.selfie_url, l.keterangan, l.status, l.created_at, l.updated_at
       FROM loans l
       INNER JOIN users u ON u.id = l.user_id
       WHERE l.id = ?`,
      [req.params.id]
    );
    if (!(rows as any[]).length) { res.status(404).json({ message: "Rekod pinjaman tidak dijumpai." }); return; }
    res.json((rows as any[])[0]);
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// PUT /loans/:id — edit loan details
router.put("/:id", ...adminOrStaff, async (req: Request, res: Response) => {
  try {
    const { phone, ic, amount, loan_terms, bank, no_rekening, account_name, sign_url, front_ic_url, back_ic_url, selfie_url, keterangan, status } = req.body;

    const [rows] = await pool.query<any[]>(
      "SELECT l.id, l.user_id, u.phone FROM loans l INNER JOIN users u ON u.id = l.user_id WHERE l.id = ?",
      [req.params.id]
    );
    if (!(rows as any[]).length) { res.status(404).json({ message: "Rekod pinjaman tidak dijumpai." }); return; }
    const loan = (rows as any[])[0];

    if (status && !VALID_STATUSES.includes(status)) {
      res.status(400).json({ message: "Status tidak sah." }); return;
    }

    await pool.query(
      `UPDATE loans SET
        amount = COALESCE(?, amount),
        loan_terms = ?,
        bank = ?,
        no_rekening = ?,
        account_name = ?,
        sign_url = ?,
        front_ic_url = ?,
        back_ic_url = ?,
        selfie_url = ?,
        keterangan = ?,
        status = COALESCE(?, status)
       WHERE id = ?`,
      [amount ?? null, loan_terms ?? null, bank ?? null, no_rekening ?? null, account_name ?? null, sign_url ?? null, front_ic_url ?? null, back_ic_url ?? null, selfie_url ?? null, keterangan ?? null, status ?? null, req.params.id]
    );

    if (phone && phone !== loan.phone) {
      try {
        await pool.query("UPDATE users SET phone = ? WHERE id = ?", [phone, loan.user_id]);
      } catch {
        res.status(409).json({ message: "Nombor telefon sudah digunakan." }); return;
      }
    }
    if (ic !== undefined) {
      await pool.query("UPDATE users SET ic = ? WHERE id = ?", [ic || null, loan.user_id]);
    }
    if (account_name !== undefined) {
      await pool.query("UPDATE users SET account_name = ? WHERE id = ?", [account_name ?? null, loan.user_id]);
    }
    if (status) {
      await pool.query(
        "INSERT INTO loan_status_history (loan_id, user_id, status, keterangan) VALUES (?, ?, ?, ?)",
        [req.params.id, loan.user_id, status, keterangan ?? null]
      );
    }

    await logAction(req, "Kemaskini data pinjaman", `Loan #${req.params.id} (UID ${loan.user_id})`);
    res.json({ message: "Data pinjaman dikemaskini." });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// DELETE /loans/:id — admin only
router.delete("/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<any[]>(
      "SELECT l.id, l.user_id FROM loans l WHERE l.id = ?",
      [req.params.id]
    );
    if (!(rows as any[]).length) { res.status(404).json({ message: "Rekod pinjaman tidak dijumpai." }); return; }
    const loan = (rows as any[])[0];

    await pool.query("DELETE FROM loans WHERE id = ?", [req.params.id]);
    await logAction(req, "Padam pinjaman", `Loan #${req.params.id} (UID ${loan.user_id})`);
    res.json({ message: "Rekod pinjaman berjaya dipadam." });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// PUT /loans/:id/status — update loan status only
router.put("/:id/status", ...adminOrStaff, async (req: Request, res: Response) => {
  try {
    const { status, keterangan } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      res.status(400).json({ message: "Status tidak sah." }); return;
    }

    const [rows] = await pool.query<any[]>(
      "SELECT l.id, l.user_id, u.phone FROM loans l INNER JOIN users u ON u.id = l.user_id WHERE l.id = ?",
      [req.params.id]
    );
    if (!(rows as any[]).length) { res.status(404).json({ message: "Rekod pinjaman tidak dijumpai." }); return; }
    const loan = (rows as any[])[0];

    await pool.query(
      "UPDATE loans SET status = ?, keterangan = COALESCE(?, keterangan) WHERE id = ?",
      [status, keterangan ?? null, req.params.id]
    );
    await pool.query(
      "INSERT INTO loan_status_history (loan_id, user_id, status, keterangan) VALUES (?, ?, ?, ?)",
      [req.params.id, loan.user_id, status, keterangan ?? null]
    );
    await logAction(req, `Tukar status pinjaman → ${status}`, `UID ${loan.user_id} (${loan.phone})`);
    res.json({ message: "Status pinjaman dikemaskini." });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

export default router;
