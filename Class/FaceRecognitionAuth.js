import fs from "fs/promises";
import path from "path";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const SIMILARITY_THRESHOLD = Number(process.env.SIMILARITY_THRESHOLD || 0.82);
const DATA_FILE = path.join(process.cwd(), "users.json");

// --- Utils ---
const ensureDataFile = async () => {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ users: [] }, null, 2));
  }
};

const readUsers = async () => {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw).users || [];
};

const writeUsers = async (users) => {
  await fs.writeFile(DATA_FILE, JSON.stringify({ users }, null, 2));
};

// Cosine similarity between two equal-length vectors
const cosineSimilarity = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    throw new Error("Embedding vectors must be arrays of equal length.");
  }
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = Number(a[i]);
    const y = Number(b[i]);
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
};

// Simple bearer auth middleware
const auth = (req, res, next) => {
  const header = req.header("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// --- Security / Middleware ---
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" })); // embeddings are small
app.use(morgan("dev"));

// Rate limit sensitive endpoints
const sensitiveLimiter = rateLimit({
  windowMs: 60_000,
  max: 30, // 30 requests/min
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(["/enroll", "/auth/face"], sensitiveLimiter);

// --- Routes ---

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, threshold: SIMILARITY_THRESHOLD });
});

/**
 * Enroll a user with an initial face embedding.
 * Body: { userId: string, name?: string, embedding: number[] }
 * Note: You should compute the embedding client-side (e.g., face-api.js) and send it here.
 */
app.post("/enroll", async (req, res) => {
  try {
    const { userId, name, embedding } = req.body || {};
    if (
      typeof userId !== "string" ||
      !Array.isArray(embedding) ||
      embedding.length < 16 // basic sanity check
    ) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const users = await readUsers();
    const existing = users.find((u) => u.userId === userId);

    if (existing) {
      // Update embedding (e.g., re-enroll or improve template)
      existing.embedding = embedding.map(Number);
      existing.updatedAt = new Date().toISOString();
    } else {
      users.push({
        userId,
        name: typeof name === "string" ? name : undefined,
        embedding: embedding.map(Number),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    await writeUsers(users);
    return res.json({ ok: true, userId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * Authenticate by face.
 * Body: { userId: string, embedding: number[] }
 * Returns: { token, similarity } on success if similarity >= threshold
 */
app.post("/auth/face", async (req, res) => {
  try {
    const { userId, embedding } = req.body || {};
    if (
      typeof userId !== "string" ||
      !Array.isArray(embedding) ||
      embedding.length < 16
    ) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const users = await readUsers();
    const user = users.find((u) => u.userId === userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.embedding.length !== embedding.length) {
      // You should keep your client embedding dimensionality consistent
      return res.status(400).json({
        error: "Embedding dimensions mismatch. Re-enroll user with current model.",
      });
    }

    const similarity = cosineSimilarity(user.embedding, embedding.map(Number));

    if (similarity >= SIMILARITY_THRESHOLD) {
      const token = jwt.sign(
        { sub: user.userId, name: user.name || null },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      return res.json({ token, similarity, userId: user.userId });
    } else {
      return res.status(401).json({
        error: "Face not recognized (below threshold).",
        similarity,
        threshold: SIMILARITY_THRESHOLD,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Protected example
app.get("/me", auth, async (req, res) => {
  const users = await readUsers();
  const me = users.find((u) => u.userId === req.user.sub);
  res.json({ user: { userId: me?.userId, name: me?.name } });
});

// List users (dev only – restrict/remove in production)
app.get("/_debug/users", async (_req, res) => {
  const users = await readUsers();
  res.json({ count: users.length, users: users.map(u => ({ userId: u.userId, name: u.name })) });
});

// Start
app.listen(PORT, async () => {
  await ensureDataFile();
  console.log(`Face-auth backend listening on http://localhost:${PORT}`);
});
