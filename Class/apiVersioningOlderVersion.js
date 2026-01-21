// ===== Imports =====
import express from "express";

// ===== App Instance =====
const app = express();
app.use(express.json());

// ===== Constants =====
const PORT = 5000;
const SUPPORTED_VERSIONS = ["v1", "v2"];
const DEFAULT_VERSION = "v1";

// ===== Request Logger Middleware =====
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ===== Version Extractor Middleware =====
const extractVersion = (req, res, next) => {
  let version =
    req.headers["api-version"] ||
    req.query.version ||
    req.originalUrl.split("/")[2];

  if (!version) version = DEFAULT_VERSION;

  if (!SUPPORTED_VERSIONS.includes(version)) {
    console.log("❌ Unsupported API version:", version);
    return res.status(400).json({
      error: "Unsupported API version",
      supported: SUPPORTED_VERSIONS,
    });
  }

  req.apiVersion = version;
  console.log("✔ API Version:", version);
  next();
};

// ===== Deprecation Warning Middleware =====
const deprecationCheck = (req, res, next) => {
  if (req.apiVersion === "v1") {
    res.setHeader(
      "Warning",
      '299 - "API v1 is deprecated and will be removed in future releases"'
    );
    console.log("⚠ Deprecated API version used");
  }
  next();
};

// ===== Version Router Factory =====
const versionRouter = () => {
  const router = express.Router();

  // ===== Shared Route =====
  router.get("/status", (req, res) => {
    res.json({
      version: req.apiVersion,
      status: "ok",
      timestamp: Date.now(),
    });
  });

  return router;
};

// ===== v1 Routes =====
const v1Router = express.Router();

v1Router.get("/users", (req, res) => {
  console.log("👤 v1 users endpoint");
  res.json({
    version: "v1",
    users: ["Alice", "Bob"],
  });
});

v1Router.post("/orders", (req, res) => {
  console.log("📦 v1 create order");
  res.json({
    version: "v1",
    message: "Order created (legacy logic)",
  });
});

// ===== v2 Routes =====
const v2Router = express.Router();

v2Router.get("/users", (req, res) => {
  console.log("👤 v2 users endpoint");
  res.json({
    version: "v2",
    users: [
      { id: 1, name: "Alice", role: "admin" },
      { id: 2, name: "Bob", role: "user" },
    ],
  });
});

v2Router.post("/orders", (req, res) => {
  const { product, quantity } = req.body;
  console.log("📦 v2 create order:", product, quantity);
  res.json({
    version: "v2",
    message: "Order created (new logic)",
    data: { product, quantity },
  });
});

// ===== Version Dispatcher =====
const dispatchByVersion = (req, res, next) => {
  switch (req.apiVersion) {
    case "v1":
      return v1Router(req, res, next);
    case "v2":
      return v2Router(req, res, next);
    default:
      return res.status(500).json({ error: "Version dispatch failure" });
  }
};

// ===== Apply Versioned Routing =====
app.use(
  "/api",
  extractVersion,
  deprecationCheck,
  versionRouter(),
  dispatchByVersion
);

// ===== Fallback Route =====
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    hint: "Check API version and endpoint",
  });
});

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// ===== Server Start =====
app.listen(PORT, () => {
  console.log(`🚀 API Versioning Server running on http://localhost:${PORT}`);
  console.log("✔ Supported versions:", SUPPORTED_VERSIONS.join(", "));
});
