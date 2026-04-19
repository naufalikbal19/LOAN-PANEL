import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { logAction } from "../middleware/logger";

const router = Router();
const adminOnly = [requireAuth, requireRole("admin")];

// GET /admins — list all admin/staff
router.get("/", requireAuth, requireRole("admin", "staff"), async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = "SELECT id, name, email, role, is_active, created_at FROM users WHERE role IN ('admin','staff')";
    const params: string[] = [];
    if (search) {
      query += " AND (name LIKE ? OR email LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like);
    }
    query += " ORDER BY role ASC, name ASC";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// POST /admins — create admin/staff (admin only)
router.post("/", ...adminOnly, async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body as { name: string; email: string; password: string; role: string };
    if (!name?.trim() || !email?.trim() || !password || !role) {
      res.status(400).json({ message: "Semua medan wajib diisi." }); return;
    }
    if (!["admin", "staff"].includes(role)) {
      res.status(400).json({ message: "Peranan tidak sah." }); return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: "Kata laluan minimum 6 aksara." }); return;
    }

    const [existing] = await pool.query<any[]>("SELECT id FROM users WHERE email = ? LIMIT 1", [email.trim().toLowerCase()]);
    if ((existing as any[]).length > 0) {
      res.status(409).json({ message: "E-mel sudah digunakan." }); return;
    }

    const hashed = await bcrypt.hash(password, 12);
    await pool.query(
      "INSERT INTO users (name, email, password, role, status, is_active) VALUES (?, ?, ?, ?, 'active', 1)",
      [name.trim(), email.trim().toLowerCase(), hashed, role]
    );

    await logAction(req, "Tambah admin/staff", `${name} (${role})`);
    res.status(201).json({ message: "Akaun berjaya dibuat." });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") { res.status(409).json({ message: "E-mel sudah digunakan." }); return; }
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// PUT /admins/:id — edit admin/staff (admin only)
router.put("/:id", ...adminOnly, async (req: Request, res: Response) => {
  try {
    const { name, email, role, is_active, password } = req.body;
    if (role && !["admin", "staff"].includes(role)) {
      res.status(400).json({ message: "Peranan tidak sah." }); return;
    }

    const [rows] = await pool.query<any[]>("SELECT id, name FROM users WHERE id = ? AND role IN ('admin','staff')", [req.params.id]);
    if (!(rows as any[]).length) { res.status(404).json({ message: "Admin tidak dijumpai." }); return; }
    const target = (rows as any[])[0];

    let query = "UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role), is_active = COALESCE(?, is_active)";
    const params: any[] = [name ?? null, email?.trim().toLowerCase() ?? null, role ?? null, is_active ?? null];

    if (password) {
      if (password.length < 6) { res.status(400).json({ message: "Kata laluan minimum 6 aksara." }); return; }
      const hashed = await bcrypt.hash(password, 12);
      query += ", password = ?";
      params.push(hashed);
    }

    query += " WHERE id = ? AND role IN ('admin','staff')";
    params.push(req.params.id);

    await pool.query(query, params);
    await logAction(req, "Kemaskini admin/staff", target.name);
    res.json({ message: "Akaun berjaya dikemaskini." });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") { res.status(409).json({ message: "E-mel sudah digunakan." }); return; }
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// DELETE /admins/:id (admin only, cannot delete self)
router.delete("/:id", ...adminOnly, async (req: Request, res: Response) => {
  try {
    if (String(req.user!.id) === req.params.id) {
      res.status(400).json({ message: "Anda tidak boleh memadam akaun sendiri." }); return;
    }
    const [rows] = await pool.query<any[]>("SELECT id, name FROM users WHERE id = ? AND role IN ('admin','staff')", [req.params.id]);
    if (!(rows as any[]).length) { res.status(404).json({ message: "Admin tidak dijumpai." }); return; }
    const target = (rows as any[])[0];

    await pool.query("DELETE FROM users WHERE id = ? AND role IN ('admin','staff')", [req.params.id]);
    await logAction(req, "Padam admin/staff", target.name);
    res.json({ message: "Akaun berjaya dipadam." });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

export default router;
