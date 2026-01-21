/**
 * Senior-level Express API setup
 * - Secure CORS
 * - JWT Auth
 * - Role-based access
 * - API Versioning
 * - Centralized error handling
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

const app = express();

/* =======================
   ENV CONFIG
======================= */
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

/* =======================
   GLOBAL MIDDLEWARE
======================= */

// Security headers
app.use(helmet());

// JSON parsing
app.use(express.json({ limit: "1mb" }));

// Request logging
if (NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// Rate limiting (basic DDOS protection)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* =======================
   CORS CONFIG (PRODUCTION SAFE)
======================= */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4200",
  "https://wham.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS: Origin not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  })
);

/* =======================
   AUTH MIDDLEWARE
======================= */

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/* =======================
   ROLE-BASED ACCESS
======================= */

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

/* =======================
   API VERSIONING
======================= */

const apiV1 = express.Router();
const apiV2 = express.Router();

/* -------- V1 ROUTES -------- */

apiV1.get("/health", (req, res) => {
  res.json({ status: "ok", version: "v1" });
});

apiV1.get("/profile", authenticate, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    version: "v1",
  });
});

/* -------- V2 ROUTES -------- */

apiV2.get("/health", (req, res) => {
  res.json({
    status: "ok",
    version: "v2",
    timestamp: new Date().toISOString(),
  });
});

apiV2.get(
  "/admin/stats",
  authenticate,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      users: 1240,
      activeSessions: 87,
      uptime: process.uptime(),
    });
  }
);

/* =======================
   ROUTE REGISTRATION
======================= */

app.use("/api/v1", apiV1);
app.use("/api/v2", apiV2);

/* =======================
   GLOBAL ERROR HANDLER
======================= */

app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.message?.includes("CORS")) {
    return res.status(403).json({ error: err.message });
  }

  res.status(500).json({
    error: "Internal Server Error",
    ...(NODE_ENV === "development" && { stack: err.stack }),
  });
});

/* =======================
   SERVER START
======================= */

app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT} (${NODE_ENV})`);
});
