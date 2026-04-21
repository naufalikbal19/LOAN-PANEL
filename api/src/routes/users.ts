import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { logAction } from "../middleware/logger";

const router = Router();
const adminOrStaff = [requireAuth, requireRole("admin", "staff")];

async function getMemberName(id: string | string[]): Promise<string> {
  const [rows] = await pool.query<any[]>("SELECT name FROM users WHERE id = ? LIMIT 1", [id]);
  return (rows as any[])[0]?.name ?? `#${id}`;
}

const VALID_MEMBER_STATUS = ["normal", "suspended", "blocked"];
const VALID_GENDER = ["male", "female", "other"];

// GET /users — list all clients
router.get("/", ...adminOrStaff, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT u.id, u.name, u.ic, u.phone, u.status, u.member_status,
             u.credit_score, u.withdrawal_password, u.balance, u.created_at,
             u.ip_client, u.avatar, u.level, u.gender, u.bank, u.no_rekening,
             u.birthday, u.loan_purpose, u.monthly_income, u.current_address,
             u.motto, u.points, u.consecutive_login_days, u.number_of_failures,
             (SELECT COUNT(*) FROM loans l WHERE l.user_id = u.id AND l.status = 'under_review') AS pending_loans
      FROM users u
      WHERE u.role = 'client'
    `;
    const params: string[] = [];

    if (status && status !== "all") {
      query += " AND u.status = ?";
      params.push(status as string);
    }
    if (search) {
      query += " AND (u.name LIKE ? OR u.ic LIKE ? OR u.phone LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    query += " ORDER BY u.created_at DESC";
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
      `SELECT id, name, ic, phone, status, member_status, credit_score, withdrawal_password, balance,
              ip_client, avatar, level, gender, bank, no_rekening, birthday, loan_purpose,
              monthly_income, current_address, motto, points, consecutive_login_days, number_of_failures,
              created_at, updated_at
       FROM users WHERE id = ? AND role = 'client'`,
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
    const {
      name, phone, ic, status, member_status, credit_score, withdrawal_password, balance,
      ip_client, avatar, level, gender, bank, no_rekening, birthday, loan_purpose,
      monthly_income, current_address, motto, points, consecutive_login_days, number_of_failures,
      new_password,
    } = req.body;

    const allowedStatus = ["pending", "active", "rejected"];
    if (status && !allowedStatus.includes(status)) { res.status(400).json({ message: "Status tidak sah." }); return; }
    if (member_status && !VALID_MEMBER_STATUS.includes(member_status)) { res.status(400).json({ message: "Member status tidak sah." }); return; }
    if (gender && !VALID_GENDER.includes(gender)) { res.status(400).json({ message: "Gender tidak sah." }); return; }

    let hashedPassword: string | null = null;
    if (new_password) {
      if (String(new_password).length < 6) { res.status(400).json({ message: "Password minimum 6 aksara." }); return; }
      hashedPassword = await bcrypt.hash(String(new_password), 12);
    }

    const memberName = await getMemberName(req.params.id);
    await pool.query(
      `UPDATE users SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        ic = COALESCE(?, ic),
        status = COALESCE(?, status),
        member_status = COALESCE(?, member_status),
        credit_score = COALESCE(?, credit_score),
        withdrawal_password = COALESCE(?, withdrawal_password),
        balance = COALESCE(?, balance),
        ip_client = ?,
        avatar = ?,
        level = COALESCE(?, level),
        gender = ?,
        bank = ?,
        no_rekening = ?,
        birthday = ?,
        loan_purpose = ?,
        monthly_income = ?,
        current_address = ?,
        motto = ?,
        points = COALESCE(?, points),
        consecutive_login_days = COALESCE(?, consecutive_login_days),
        number_of_failures = COALESCE(?, number_of_failures),
        password = COALESCE(?, password)
       WHERE id = ? AND role = 'client'`,
      [
        name ?? null, phone ?? null, ic ?? null, status ?? null,
        member_status ?? null, credit_score ?? null, withdrawal_password ?? null, balance ?? null,
        ip_client ?? null, avatar ?? null, level ?? null, gender ?? null,
        bank ?? null, no_rekening ?? null, birthday ?? null, loan_purpose ?? null,
        monthly_income ?? null, current_address ?? null, motto ?? null,
        points ?? null, consecutive_login_days ?? null, number_of_failures ?? null,
        hashedPassword,
        req.params.id,
      ]
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
