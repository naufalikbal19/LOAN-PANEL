import { Router, Request, Response } from "express";
import { pool } from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { logAction } from "../middleware/logger";

const router = Router();
const adminOrStaff = [requireAuth, requireRole("admin", "staff")];

const VALID_STATUSES = [
  "under_review", "loan_approved", "credit_frozen",
  "unfrozen_processing", "credit_score_low", "payment_processing", "loan_being_canceled",
];

// GET /loans — list all loans joined with user info
router.get("/", ...adminOrStaff, async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT l.id, l.user_id, u.phone, l.amount, l.bank, l.no_rekening, l.status, l.created_at, l.updated_at
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
      query += " AND (u.phone LIKE ? OR CAST(l.user_id AS CHAR) LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like);
    }

    query += " ORDER BY l.created_at DESC";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// PUT /loans/:id — edit loan details (amount, bank, no_rekening, status, phone)
router.put("/:id", ...adminOrStaff, async (req: Request, res: Response) => {
  try {
    const { phone, amount, bank, no_rekening, status } = req.body;

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
      "UPDATE loans SET amount = COALESCE(?, amount), bank = COALESCE(?, bank), no_rekening = COALESCE(?, no_rekening), status = COALESCE(?, status) WHERE id = ?",
      [amount ?? null, bank ?? null, no_rekening ?? null, status ?? null, req.params.id]
    );

    if (phone && phone !== loan.phone) {
      try {
        await pool.query("UPDATE users SET phone = ? WHERE id = ?", [phone, loan.user_id]);
      } catch {
        res.status(409).json({ message: "Nombor telefon sudah digunakan." }); return;
      }
    }

    await logAction(req, "Kemaskini data pinjaman", `Loan #${req.params.id} (UID ${loan.user_id})`);
    res.json({ message: "Data pinjaman dikemaskini." });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// PUT /loans/:id/status — update loan status only
router.put("/:id/status", ...adminOrStaff, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      res.status(400).json({ message: "Status tidak sah." }); return;
    }

    const [rows] = await pool.query<any[]>(
      "SELECT l.id, l.user_id, u.phone FROM loans l INNER JOIN users u ON u.id = l.user_id WHERE l.id = ?",
      [req.params.id]
    );
    if (!(rows as any[]).length) { res.status(404).json({ message: "Rekod pinjaman tidak dijumpai." }); return; }
    const loan = (rows as any[])[0];

    await pool.query("UPDATE loans SET status = ? WHERE id = ?", [status, req.params.id]);
    await logAction(req, `Tukar status pinjaman → ${status}`, `UID ${loan.user_id} (${loan.phone})`);
    res.json({ message: "Status pinjaman dikemaskini." });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

export default router;
