import { Router } from "express";
import { pool } from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { logAction } from "../middleware/logger";

const router = Router();
const adminOrStaff = [requireAuth, requireRole("admin", "staff")];

async function getMemberName(id: string): Promise<string> {
  const [rows] = await pool.query<any[]>("SELECT name FROM users WHERE id = ? LIMIT 1", [id]);
  return (rows as any[])[0]?.name ?? `#${id}`;
}

// GET /users — list all clients
router.get("/", ...adminOrStaff, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = "SELECT id, name, ic, phone, status, created_at FROM users WHERE role = 'client'";
    const params: string[] = [];

    if (status && status !== "all") {
      query += " AND status = ?";
      params.push(status as string);
    }
    if (search) {
      query += " AND (name LIKE ? OR ic LIKE ? OR phone LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    query += " ORDER BY created_at DESC";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// GET /users/:id — single member detail
router.get("/:id", ...adminOrStaff, async (req, res) => {
  try {
    const [rows] = await pool.query<any[]>(
      "SELECT id, name, ic, phone, status, created_at, updated_at FROM users WHERE id = ? AND role = 'client'",
      [req.params.id]
    );
    if (!(rows as any[]).length) { res.status(404).json({ message: "Ahli tidak dijumpai." }); return; }
    res.json((rows as any[])[0]);
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// PUT /users/:id — edit member
router.put("/:id", ...adminOrStaff, async (req, res) => {
  try {
    const { name, phone, ic, status } = req.body;
    const allowed = ["pending", "active", "rejected"];
    if (status && !allowed.includes(status)) { res.status(400).json({ message: "Status tidak sah." }); return; }

    const memberName = await getMemberName(req.params.id);
    await pool.query(
      "UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), ic = COALESCE(?, ic), status = COALESCE(?, status) WHERE id = ? AND role = 'client'",
      [name ?? null, phone ?? null, ic ?? null, status ?? null, req.params.id]
    );

    await logAction(req, "Kemaskini ahli", memberName);
    res.json({ message: "Ahli berjaya dikemaskini." });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") { res.status(400).json({ message: "IC atau nombor telefon sudah digunakan." }); return; }
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// DELETE /users/:id — delete member (admin only)
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const memberName = await getMemberName(req.params.id);
    const [result] = await pool.query<any>(
      "DELETE FROM users WHERE id = ? AND role = 'client'",
      [req.params.id]
    );
    if (result.affectedRows === 0) { res.status(404).json({ message: "Ahli tidak dijumpai." }); return; }

    await logAction(req, "Padam ahli", memberName);
    res.json({ message: "Ahli berjaya dipadam." });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// PUT /users/:id/approve
router.put("/:id/approve", ...adminOrStaff, async (req, res) => {
  try {
    const memberName = await getMemberName(req.params.id);
    const [result] = await pool.query<any>(
      "UPDATE users SET status = 'active' WHERE id = ? AND role = 'client' AND status = 'pending'",
      [req.params.id]
    );
    if (result.affectedRows === 0) { res.status(404).json({ message: "Ahli tidak dijumpai atau bukan dalam status pending." }); return; }

    await logAction(req, "Luluskan ahli", memberName);
    res.json({ message: "Ahli berjaya diluluskan." });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// PUT /users/:id/reject
router.put("/:id/reject", ...adminOrStaff, async (req, res) => {
  try {
    const memberName = await getMemberName(req.params.id);
    const [result] = await pool.query<any>(
      "UPDATE users SET status = 'rejected' WHERE id = ? AND role = 'client' AND status = 'pending'",
      [req.params.id]
    );
    if (result.affectedRows === 0) { res.status(404).json({ message: "Ahli tidak dijumpai atau bukan dalam status pending." }); return; }

    await logAction(req, "Tolak ahli", memberName);
    res.json({ message: "Ahli telah ditolak." });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

export default router;
