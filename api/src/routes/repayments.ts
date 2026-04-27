import { Router, Request, Response } from "express";
import { pool } from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { logAction } from "../middleware/logger";

const router = Router();
const adminOrStaff = [requireAuth, requireRole("admin", "staff")];

// GET /repayments/my — client sees own repayments
router.get("/my", requireAuth, requireRole("client"), async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<any[]>(
      `SELECT r.id, r.loan_id, r.amount, r.installment_no, r.due_date,
              r.receipt_url, r.status, r.note, r.created_at
       FROM repayments r
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [req.user!.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// POST /repayments — client submits repayment receipt
router.post("/", requireAuth, requireRole("client"), async (req: Request, res: Response) => {
  try {
    const { loan_id, amount, installment_no, due_date, receipt_url } = req.body;
    if (!loan_id || !amount || !installment_no || !due_date) {
      res.status(400).json({ message: "loan_id, amount, installment_no, dan due_date wajib diisi." });
      return;
    }

    // Verify loan belongs to this client
    const [loanRows] = await pool.query<any[]>(
      "SELECT id FROM loans WHERE id = ? AND user_id = ? LIMIT 1",
      [loan_id, req.user!.id]
    );
    if (!loanRows.length) {
      res.status(403).json({ message: "Pinjaman tidak dijumpai." });
      return;
    }

    // Check no pending repayment already for this installment
    const [existing] = await pool.query<any[]>(
      "SELECT id FROM repayments WHERE loan_id = ? AND installment_no = ? AND status = 'pending' LIMIT 1",
      [loan_id, installment_no]
    );
    if (existing.length) {
      res.status(409).json({ message: "Anda sudah menghantar bukti pembayaran untuk ansuran ini. Sila tunggu kelulusan." });
      return;
    }

    const [result] = await pool.query<any>(
      `INSERT INTO repayments (loan_id, user_id, amount, installment_no, due_date, receipt_url, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [loan_id, req.user!.id, parseFloat(amount), parseInt(installment_no), due_date, receipt_url || null]
    );
    res.status(201).json({ message: "Bukti pembayaran berjaya dihantar.", id: (result as any).insertId });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// GET /repayments — admin/staff: all repayments with user + loan info
router.get("/", ...adminOrStaff, async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT r.id, r.loan_id, r.user_id, r.amount, r.installment_no,
             r.due_date, r.receipt_url, r.status, r.note, r.created_at,
             u.name, u.phone,
             l.amount AS loan_amount, l.loan_terms
      FROM repayments r
      INNER JOIN users u ON u.id = r.user_id
      INNER JOIN loans l ON l.id = r.loan_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (status && status !== "all") { query += " AND r.status = ?"; params.push(status); }
    if (search) {
      query += " AND (u.name LIKE ? OR u.phone LIKE ? OR CAST(r.user_id AS CHAR) LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    query += " ORDER BY r.created_at DESC";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// PUT /repayments/:id/status — admin/staff: approve or reject
router.put("/:id/status", ...adminOrStaff, async (req: Request, res: Response) => {
  try {
    const { status, note } = req.body;
    if (!status || !["approved", "rejected"].includes(status)) {
      res.status(400).json({ message: "Status mesti 'approved' atau 'rejected'." });
      return;
    }
    const [rows] = await pool.query<any[]>("SELECT id FROM repayments WHERE id = ?", [req.params.id]);
    if (!rows.length) { res.status(404).json({ message: "Rekod tidak dijumpai." }); return; }
    await pool.query("UPDATE repayments SET status = ?, note = ? WHERE id = ?", [status, note || null, req.params.id]);
    await logAction(req, `${status === "approved" ? "Lulus" : "Tolak"} bayaran balik`, `Repayment #${req.params.id}`);
    res.json({ message: `Bayaran balik berjaya ${status === "approved" ? "diluluskan" : "ditolak"}.` });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

export default router;
