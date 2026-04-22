import { Router, Request, Response } from "express";
import { pool } from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { logAction } from "../middleware/logger";

const router = Router();
const adminOrStaff = [requireAuth, requireRole("admin", "staff")];

// GET /messages/my — client: own messages
router.get("/my", requireAuth, requireRole("client"), async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<any[]>(
      "SELECT id, title, content, is_read, created_at FROM messages WHERE user_id = ? ORDER BY created_at DESC",
      [req.user!.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// PUT /messages/my/:id/read — client: mark message as read
router.put("/my/:id/read", requireAuth, requireRole("client"), async (req: Request, res: Response) => {
  try {
    await pool.query<any>(
      "UPDATE messages SET is_read = 1 WHERE id = ? AND user_id = ?",
      [req.params.id, req.user!.id]
    );
    res.json({ message: "Dibaca." });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// GET /messages — admin: all messages with user info
router.get("/", ...adminOrStaff, async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<any[]>(
      `SELECT m.id, m.user_id, u.name, u.phone, m.title, m.content, m.is_read, m.created_at
       FROM messages m
       JOIN users u ON u.id = m.user_id
       ORDER BY m.created_at DESC`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// POST /messages — admin: send message (single user or all clients)
router.post("/", ...adminOrStaff, async (req: Request, res: Response) => {
  const { user_id, title, content, broadcast } = req.body as {
    user_id?: number; title: string; content: string; broadcast?: boolean;
  };
  if (!title?.trim() || !content?.trim()) {
    res.status(422).json({ message: "Tajuk dan kandungan mesej wajib diisi." }); return;
  }
  try {
    if (broadcast) {
      const [clients] = await pool.query<any[]>(
        "SELECT id FROM users WHERE role = 'client' AND status = 'active'"
      );
      for (const c of clients as { id: number }[]) {
        await pool.query<any>(
          "INSERT INTO messages (user_id, title, content) VALUES (?, ?, ?)",
          [c.id, title, content]
        );
      }
      await logAction(req as any, "Broadcast mesej", title);
      res.json({ message: `Mesej dihantar ke ${(clients as any[]).length} ahli.` });
    } else {
      if (!user_id) { res.status(422).json({ message: "Pilih ahli atau gunakan broadcast." }); return; }
      await pool.query<any>(
        "INSERT INTO messages (user_id, title, content) VALUES (?, ?, ?)",
        [user_id, title, content]
      );
      await logAction(req as any, "Hantar mesej", `user #${user_id} — ${title}`);
      res.json({ message: "Mesej berjaya dihantar." });
    }
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// DELETE /messages/:id — admin: delete message
router.delete("/:id", ...adminOrStaff, async (req: Request, res: Response) => {
  try {
    await pool.query<any>("DELETE FROM messages WHERE id = ?", [req.params.id]);
    await logAction(req as any, "Padam mesej", `#${req.params.id}`);
    res.json({ message: "Mesej dipadam." });
  } catch {
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

export default router;
