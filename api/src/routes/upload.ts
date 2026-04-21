import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middleware/auth";

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Hanya fail imej dibenarkan."));
  },
});

router.post("/", requireAuth, upload.single("file"), (req: Request, res: Response) => {
  if (!req.file) { res.status(400).json({ message: "Tiada fail diterima." }); return; }
  res.json({ url: `/uploads/${req.file.filename}` });
});

export default router;
