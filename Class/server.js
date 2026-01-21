// ===== Imports & Setup =====
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { createClient } from "redis";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { gql } from "graphql-tag";

// ===== App & Constants =====
const app = express();
const PORT = 4000;
const JWT_SECRET = "SUPER_SECRET_KEY";

// ===== Redis Client =====
const redis = createClient({ url: "redis://localhost:6379" });
redis.on("connect", () => console.log("✔ Redis connected"));
redis.on("error", (e) => console.error("✖ Redis error", e));
await redis.connect();

// ===== Global Middleware =====
app.use(cors());
app.use(express.json());

// ===== Rate Limiter =====
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
});
app.use(limiter);

// ===== Auth Middleware =====
const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No token" });

  try {
    const token = auth.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    console.log("✔ Auth user:", req.user.username);
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// ===== RBAC Middleware =====
const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    console.log("✖ RBAC denied:", req.user.role);
    return res.status(403).json({ message: "Forbidden" });
  }
  console.log("✔ RBAC allowed:", req.user.role);
  next();
};

// ===== REST Auth Route =====
app.post("/api/v1/login", (req, res) => {
  const { username, role } = req.body;
  const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: "2h" });
  console.log("🔑 Login:", username, role);
  res.json({ token });
});

// ===== REST Health Check =====
app.get("/api/v1/ping", (req, res) => {
  console.log("📡 Ping v1");
  res.json({ message: "pong v1" });
});

// ===== Protected REST Route =====
app.get("/api/v1/secure", authenticate, (req, res) => {
  res.json({ message: "Secure data", user: req.user });
});

// ===== Admin Only REST Route =====
app.get(
  "/api/v1/admin",
  authenticate,
  allowRoles("admin"),
  (req, res) => {
    res.json({ message: "Admin panel access granted" });
  }
);

// ===== GraphQL Schema =====
const typeDefs = gql`
  type Query {
    hello: String
    cacheGet(key: String!): String
  }

  type Mutation {
    cacheSet(key: String!, value: String!): String
  }
`;

// ===== GraphQL Resolvers =====
const resolvers = {
  Query: {
    hello: (_, __, ctx) => {
      console.log("🟢 GraphQL hello:", ctx.user.username);
      return `Hello ${ctx.user.username}`;
    },
    cacheGet: async (_, { key }) => {
      console.log("📥 Redis GET:", key);
      const value = await redis.get(key);
      return value || "null";
    },
  },
  Mutation: {
    cacheSet: async (_, { key, value }) => {
      console.log("📤 Redis SET:", key, value);
      await redis.set(key, value);
      return "OK";
    },
  },
};

// ===== Apollo Server =====
const apollo = new ApolloServer({
  typeDefs,
  resolvers,
});
await apollo.start();

// ===== GraphQL Middleware (Versioned) =====
app.use(
  "/api/v1/graphql",
  authenticate,
  expressMiddleware(apollo, {
    context: async ({ req }) => ({
      user: req.user,
      redis,
    }),
  })
);

// ===== Callback Demo Route =====
app.get("/api/v1/callback-test", (req, res) => {
  console.log("🔁 Callback start");
  setTimeout(() => {
    console.log("🔁 Callback executed");
    res.json({ status: "Callback finished" });
  }, 1000);
});

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.message);
  res.status(500).json({ error: "Internal error" });
});

// ===== Server Start =====
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 GraphQL at http://localhost:${PORT}/api/v1/graphql`);
});
