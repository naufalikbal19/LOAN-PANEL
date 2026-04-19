import { pool } from "../config/db";
import { Request } from "express";

export async function logAction(req: Request, action: string, target: string): Promise<void> {
  if (!req.user) return;
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";
  try {
    await pool.query(
      "INSERT INTO admin_logs (admin_id, admin_name, action, target, ip_address) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, req.user.name, action, target, ip]
    );
  } catch {
    // silent fail — logging must not block response
  }
}
