import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { pool } from "../config/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { logAction } from "../middleware/logger";

const router = Router();

// GET /settings — public
router.get("/", async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<any>("SELECT `key`, value FROM settings");
    const settings: Record<string, string> = {};
    for (const row of rows as { key: string; value: string }[]) {
      settings[row.key] = row.value ?? "";
    }
    res.json(settings);
  } catch (err) {
    console.error("[settings GET]", err);
    res.status(500).json({ message: "Ralat pelayan." });
  }
});

// PUT /settings — admin only
router.put(
  "/",
  requireAuth,
  requireRole("admin", "staff"),
  [body("settings").isObject().withMessage("Settings mesti dalam bentuk objek.")],
  async (req: Request, res: Response) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) { res.status(422).json({ message: errs.array()[0].msg }); return; }

    const { settings } = req.body as { settings: Record<string, string> };
    const allowed = [
      "company_name", "company_tagline", "logo_url", "favicon_url", "support_whatsapp", "support_phone",
      "keterangan_under_review", "keterangan_loan_approved", "keterangan_credit_frozen",
      "keterangan_unfrozen_processing", "keterangan_credit_score_low",
      "keterangan_payment_processing", "keterangan_loan_being_canceled", "keterangan_transfer_failed",
      "withdrawal_warning",
      "diiktiraf_img_1", "diiktiraf_img_2", "diiktiraf_img_3", "diiktiraf_img_4",
      "payment_methods",
      // Tema dark mode
      "dark_accent","dark_bg_primary","dark_bg_secondary","dark_bg_card","dark_bg_card_inner",
      "dark_text_primary","dark_text_secondary","dark_text_muted",
      "dark_border_color","dark_border_light","dark_nav_bg","dark_bg_image",
      // Tema light mode
      "light_accent","light_bg_primary","light_bg_secondary","light_bg_card","light_bg_card_inner",
      "light_text_primary","light_text_secondary","light_text_muted",
      "light_border_color","light_border_light","light_nav_bg","light_bg_image",
    ];

    try {
      for (const [key, value] of Object.entries(settings)) {
        if (!allowed.includes(key)) continue;
        await pool.query<any>(
          "INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?",
          [key, value, value]
        );
      }
      const keys = Object.keys(settings).filter((k) => allowed.includes(k)).join(", ");
      await logAction(req, "Kemaskini tetapan", keys || "settings");
      res.json({ message: "Tetapan berjaya dikemaskini." });
    } catch (err) {
      console.error("[settings PUT]", err);
      res.status(500).json({ message: "Ralat pelayan." });
    }
  }
);

export default router;
