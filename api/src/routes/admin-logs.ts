import { Router, Request, Response } from "express";
import { pool } from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// GET /admin-logs
router.get("/", requireAuth, requireRole("admin", "staff"), async (req: Request, res: Response) => {
  try {
    const { search, limit = "100" } = req.query;
    let query = `
      SELECT id, admin_id, admin_name, action, target, ip_address, created_at
      FROM admin_logs
    `;
    const params: any[] = [];

    if (search) {
      query += " WHERE admin_name LIKE ? OR action LIKE ? OR target LIKE ?";
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    query += " ORDER BY created_at DESC LIMIT ?";
    params.push(Number(limit));

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

export default router;
