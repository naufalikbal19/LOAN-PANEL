import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";
import { requireAuth } from "../middleware/auth";
import { logAction } from "../middleware/logger";
import { User, JwtPayload } from "../types";

const router = Router();

function normalizePhone(raw: string): string {
  const digits = raw.trim().replace(/[\s-]/g, "");
  if (digits.startsWith("+60")) return "0" + digits.slice(3);
  if (digits.startsWith("60") && digits.length >= 7) return "0" + digits.slice(2);
  if (/^1\d/.test(digits)) return "0" + digits;
  return digits;
}

// POST /auth/login
router.post(
  "/login",
  [
    body("password").notEmpty().withMessage("Kata laluan wajib diisi."),
    body().custom((_, { req }) => {
      if (!req.body.phone && !req.body.email && !req.body.name) throw new Error("Nombor telefon, e-mel, atau nama wajib diisi.");
      return true;
    }),
  ],
  async (req: Request, res: Response) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) { res.status(422).json({ message: errs.array()[0].msg }); return; }

    const { phone, email, name, password } = req.body as { phone?: string; email?: string; name?: string; password: string };

    try {
      let rows: User[];
      if (phone) {
        const normalized = normalizePhone(phone);
        [rows] = await pool.query<any>("SELECT * FROM users WHERE phone = ? AND is_active = 1 LIMIT 1", [normalized]);
      } else if (email) {
        [rows] = await pool.query<any>("SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1", [email.trim().toLowerCase()]);
      } else {
        // Login by name — admin/staff only
        [rows] = await pool.query<any>("SELECT * FROM users WHERE name = ? AND is_active = 1 AND role IN ('admin','staff') LIMIT 1", [name!.trim()]);
      }

      const user: User | undefined = rows[0];

      if (!user) { res.status(401).json({ message: "Akaun tidak dijumpai atau tidak aktif." }); return; }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) { res.status(401).json({ message: "Kata laluan tidak betul." }); return; }

      if ((email || name) && user.role === "client") { res.status(403).json({ message: "Akses ditolak. Akaun ini bukan akaun kakitangan." }); return; }
      if (phone && user.role !== "client") { res.status(403).json({ message: "Akses ditolak. Sila gunakan portal admin." }); return; }

      // Check account status
      if (user.status === "pending") {
        res.status(403).json({ message: "Akaun anda belum diverifikasi. Sila hubungi Khidmat Pelanggan.", code: "PENDING" });
        return;
      }
      if (user.status === "rejected") {
        res.status(403).json({ message: "Permohonan akaun anda telah ditolak. Sila hubungi Khidmat Pelanggan.", code: "REJECTED" });
        return;
      }

      const payload: JwtPayload = { id: user.id, name: user.name, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any });

      // Log admin/staff login only
      if (user.role !== "client") {
        const ip =
          (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
          req.socket.remoteAddress || "unknown";
        await pool.query(
          "INSERT INTO admin_logs (admin_id, admin_name, action, target, ip_address) VALUES (?, ?, ?, ?, ?)",
          [user.id, user.name, "Log masuk", "Portal Admin", ip]
        ).catch(() => {});
      }

      res.json({ token, role: user.role, name: user.name, id: user.id });
    } catch (err) {
      console.error("[login]", err);
      res.status(500).json({ message: "Ralat pelayan. Sila cuba semula." });
    }
  }
);

// POST /auth/register — client wishlist (pending approval)
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Nama penuh wajib diisi."),
    body("ic").trim().notEmpty().withMessage("Nombor IC wajib diisi.")
      .custom((val) => {
        const digits = val.replace(/-/g, "");
        if (!/^\d{5,}$/.test(digits)) throw new Error("IC mesti sekurang-kurangnya 5 digit angka.");
        return true;
      }),
    body("phone").trim().notEmpty().withMessage("Nombor telefon wajib diisi.")
      .custom((val) => {
        const normalized = normalizePhone(val);
        if (!/^\d{5,}$/.test(normalized)) throw new Error("Nombor telefon mesti sekurang-kurangnya 5 digit angka.");
        return true;
      }),
    body("password").isLength({ min: 6 }).withMessage("Kata laluan minimum 6 aksara."),
  ],
  async (req: Request, res: Response) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) { res.status(422).json({ message: errs.array()[0].msg }); return; }

    const { name, ic, phone, password } = req.body as { name: string; ic: string; phone: string; password: string };
    const normalizedPhone = normalizePhone(phone);
    const cleanIc = ic.replace(/-/g, "");

    try {
      const [existing] = await pool.query<any>("SELECT id FROM users WHERE ic = ? OR phone = ? LIMIT 1", [cleanIc, normalizedPhone]);
      if ((existing as any[]).length > 0) {
        res.status(409).json({ message: "Nombor IC atau telefon telah didaftarkan." });
        return;
      }

      const hashed = await bcrypt.hash(password, 12);
      const withdrawalPassword = String(Math.floor(100000 + Math.random() * 900000));
      const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.socket.remoteAddress || null;
      await pool.query<any>(
        "INSERT INTO users (name, ic, phone, password, role, status, withdrawal_password, ip_client, balance) VALUES (?, ?, ?, ?, 'client', 'pending', ?, ?, 0)",
        [name, cleanIc, normalizedPhone, hashed, withdrawalPassword, ip]
      );

      res.status(201).json({ message: "Permohonan anda telah dihantar. Sila tunggu pengesahan daripada pihak kami." });
    } catch (err) {
      console.error("[register]", err);
      res.status(500).json({ message: "Ralat pelayan. Sila cuba semula." });
    }
  }
);

// GET /auth/me
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<any>(
      `SELECT id, name, ic, phone, email, role, status, member_status,
              credit_score, balance, withdrawal_password, bank, no_rekening,
              avatar, level, points, gender, birthday, occupation,
              monthly_income, loan_purpose, current_address, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [req.user!.id]
    );
    const user = (rows as any[])[0];
    if (!user) { res.status(404).json({ message: "Pengguna tidak dijumpai." }); return; }
    res.json(user);
  } catch (err) {
    console.error("[me]", err);
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// PUT /auth/profile — client updates own profile
router.put("/profile", requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, ic, gender, birthday, occupation, monthly_income, loan_purpose, current_address } = req.body;
    // Convert DD/MM/YYYY → YYYY-MM-DD for MySQL DATE field
    let birthdayVal: string | null = null;
    if (birthday) {
      const m = (birthday as string).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      birthdayVal = m ? `${m[3]}-${m[2]}-${m[1]}` : null;
    }
    await pool.query(
      `UPDATE users SET
         name = COALESCE(?, name),
         ic = COALESCE(?, ic),
         gender = COALESCE(?, gender),
         birthday = COALESCE(?, birthday),
         occupation = ?,
         monthly_income = COALESCE(?, monthly_income),
         loan_purpose = ?,
         current_address = ?
       WHERE id = ?`,
      [name || null, ic || null, gender || null, birthdayVal, occupation || null, monthly_income || null, loan_purpose || null, current_address || null, req.user!.id]
    );
    res.json({ message: "Profil dikemaskini." });
  } catch (err) {
    console.error("[profile]", err);
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

export default router;
