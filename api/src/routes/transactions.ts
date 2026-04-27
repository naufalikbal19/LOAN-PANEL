import { Router, Request, Response } from "express";
import { pool } from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { logAction } from "../middleware/logger";

const router = Router();
const adminOrStaff = [requireAuth, requireRole("admin", "staff")];

// GET /transactions/my — client sees own transactions
router.get("/my", requireAuth, requireRole("client"), async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<any[]>(
      `SELECT id, type, amount, description, created_at FROM transactions
       WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user!.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// POST /transactions/withdraw — client withdraws balance
router.post("/withdraw", requireAuth, requireRole("client"), async (req: Request, res: Response) => {
  try {
    const { withdrawal_password } = req.body;
    if (!withdrawal_password) {
      res.status(400).json({ message: "Kata laluan pengeluaran wajib diisi." }); return;
    }

    // Get user info
    const [userRows] = await pool.query<any[]>(
      "SELECT id, balance, withdrawal_password FROM users WHERE id = ? LIMIT 1",
      [req.user!.id]
    );
    const user = userRows[0];
    if (!user) { res.status(404).json({ message: "Pengguna tidak dijumpai." }); return; }

    // Verify withdrawal password
    if (!user.withdrawal_password) {
      res.status(401).json({ message: "OTP pengeluaran telah digunakan. Sila hubungi perkhidmatan pelanggan." }); return;
    }
    if (String(user.withdrawal_password) !== String(withdrawal_password)) {
      res.status(401).json({ message: "Kata laluan penarikan salah. Sila hubungi perkhidmatan pelanggan untuk mendapatkan!" }); return;
    }

    // Check balance
    const balance = parseFloat(user.balance);
    if (balance <= 0) {
      res.status(400).json({ message: "Baki tidak mencukupi untuk pengeluaran." }); return;
    }

    // Check has an approved loan
    const [loanRows] = await pool.query<any[]>(
      "SELECT id FROM loans WHERE user_id = ? AND status = 'loan_approved' LIMIT 1",
      [req.user!.id]
    );
    if (!loanRows.length) {
      res.status(403).json({ message: "Pengeluaran hanya dibenarkan selepas pinjaman diluluskan." }); return;
    }

    // Deduct balance, nullify OTP (single-use), and record transaction
    await pool.query("UPDATE users SET balance = 0, withdrawal_password = NULL WHERE id = ?", [req.user!.id]);
    const [result] = await pool.query<any>(
      `INSERT INTO transactions (user_id, type, amount, description) VALUES (?, 'withdrawal', ?, ?)`,
      [req.user!.id, balance, `Pengeluaran baki pinjaman — RM ${balance.toLocaleString("ms-MY", { minimumFractionDigits: 2 })}`]
    );

    res.json({
      message: "Pengeluaran berjaya dikeluarkan! Sila semak akaun bank anda dalam masa 10-15 minit.",
      amount: balance,
      transaction_id: (result as any).insertId,
    });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// GET /transactions — admin/staff: list all with user info
router.get("/", ...adminOrStaff, async (req: Request, res: Response) => {
  try {
    const { user_id, search } = req.query;
    let query = `
      SELECT t.id, t.user_id, u.name, u.phone, t.type, t.amount, t.description, t.created_at
      FROM transactions t
      INNER JOIN users u ON u.id = t.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (user_id) { query += " AND t.user_id = ?"; params.push(user_id); }
    if (search) {
      query += " AND (u.name LIKE ? OR u.phone LIKE ? OR CAST(t.user_id AS CHAR) LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    query += " ORDER BY t.created_at DESC";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// POST /transactions — admin/staff: manual create
router.post("/", ...adminOrStaff, async (req: Request, res: Response) => {
  try {
    const { user_id, type, amount, description } = req.body;
    if (!user_id || !type || !amount) {
      res.status(400).json({ message: "user_id, type, dan amount wajib diisi." }); return;
    }
    const validTypes = ["withdrawal", "credit", "debit", "adjustment"];
    if (!validTypes.includes(type)) {
      res.status(400).json({ message: "Jenis transaksi tidak sah." }); return;
    }

    const amt = parseFloat(amount);
    const [result] = await pool.query<any>(
      "INSERT INTO transactions (user_id, type, amount, description) VALUES (?, ?, ?, ?)",
      [user_id, type, amt, description || null]
    );
    await logAction(req, `Tambah transaksi ${type}`, `UID ${user_id} — RM ${amt}`);
    res.status(201).json({ message: "Transaksi berjaya ditambah.", id: (result as any).insertId });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// PUT /transactions/:id — admin/staff: edit
router.put("/:id", ...adminOrStaff, async (req: Request, res: Response) => {
  try {
    const { type, amount, description } = req.body;
    const validTypes = ["withdrawal", "credit", "debit", "adjustment"];
    if (type && !validTypes.includes(type)) {
      res.status(400).json({ message: "Jenis transaksi tidak sah." }); return;
    }
    await pool.query(
      `UPDATE transactions SET
         type = COALESCE(?, type),
         amount = COALESCE(?, amount),
         description = COALESCE(?, description)
       WHERE id = ?`,
      [type || null, amount ? parseFloat(amount) : null, description !== undefined ? description : null, req.params.id]
    );
    await logAction(req, "Kemaskini transaksi", `Transaction #${req.params.id}`);
    res.json({ message: "Transaksi dikemaskini." });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// DELETE /transactions/:id — admin/staff: delete
router.delete("/:id", ...adminOrStaff, async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<any[]>("SELECT id FROM transactions WHERE id = ?", [req.params.id]);
    if (!rows.length) { res.status(404).json({ message: "Transaksi tidak dijumpai." }); return; }
    await pool.query("DELETE FROM transactions WHERE id = ?", [req.params.id]);
    await logAction(req, "Padam transaksi", `Transaction #${req.params.id}`);
    res.json({ message: "Transaksi berjaya dipadam." });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

export default router;
