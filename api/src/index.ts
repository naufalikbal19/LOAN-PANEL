import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRouter from "./routes/auth";
import settingsRouter from "./routes/settings";
import usersRouter from "./routes/users";
import adminLogsRouter from "./routes/admin-logs";
import adminsRouter from "./routes/admins";
import loansRouter from "./routes/loans";
import uploadRouter from "./routes/upload";
import transactionsRouter from "./routes/transactions";
import messagesRouter from "./routes/messages";
import repaymentsRouter from "./routes/repayments";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  process.env.CLIENT_ORIGIN || "https://apps.pinjamanbarakah.my",
  process.env.ADMIN_ORIGIN || "https://backendtest.pinjamanbarakah.my",
  // local dev
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser requests (Postman, server-to-server)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} tidak dibenarkan.`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// Routes
app.use("/auth", authRouter);
app.use("/settings", settingsRouter);
app.use("/users", usersRouter);
app.use("/admin-logs", adminLogsRouter);
app.use("/admins", adminsRouter);
app.use("/loans", loansRouter);
app.use("/upload", uploadRouter);
app.use("/transactions", transactionsRouter);
app.use("/messages", messagesRouter);
app.use("/repayments", repaymentsRouter);

// 404
app.use((_, res) => {
  res.status(404).json({ message: "Endpoint tidak dijumpai." });
});

app.listen(PORT, () => {
  console.log(`API berjalan di http://localhost:${PORT}`);
});
