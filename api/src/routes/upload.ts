import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Hanya fail imej dibenarkan."));
  },
});

const adminOrStaff = [requireAuth, requireRole("admin", "staff")];

// POST /upload — upload a single image
router.post("/", requireAuth, upload.single("file"), (req: Request, res: Response) => {
  if (!req.file) { res.status(400).json({ message: "Tiada fail diterima." }); return; }
  res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
});

// GET /upload/list — list all uploaded assets
router.get("/list", ...adminOrStaff, (_req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(uploadDir)
      .filter((f) => /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(f))
      .map((filename) => {
        const stat = fs.statSync(path.join(uploadDir, filename));
        return { filename, url: `/uploads/${filename}`, size: stat.size, created_at: stat.mtime.toISOString() };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(files);
  } catch {
    res.status(500).json({ message: "Ralat membaca fail." });
  }
});

// DELETE /upload/:filename — delete an uploaded asset (admin only)
router.delete("/:filename", requireAuth, requireRole("admin"), (req: Request, res: Response) => {
  try {
    const filename = path.basename(req.params.filename); // prevent path traversal
    const filepath = path.join(uploadDir, filename);
    if (!fs.existsSync(filepath)) { res.status(404).json({ message: "Fail tidak dijumpai." }); return; }
    fs.unlinkSync(filepath);
    res.json({ message: "Fail berjaya dipadam." });
  } catch {
    res.status(500).json({ message: "Ralat memadam fail." });
  }
});

export default router;
