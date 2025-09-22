/*For Hono, we can use @hono/rate-limiter
.

1. Limit Requests per IP */

import { Hono } from "hono";
import { rateLimiter } from "@hono/rate-limiter";

const app = new Hono();

// Per IP: 10,000 requests per minute
app.use(
  "*",
  rateLimiter({
    windowMs: 60 * 1000,
    limit: 10000,
    keyGenerator: (c) => c.req.header("x-forwarded-for") || c.req.header("cf-connecting-ip") || c.req.raw.conn.remoteAddress, 
    message: "Too many requests from this IP",
  })
);

/*2. Limit Requests per Endpoint

Apply limiter to only one route: */

const endpointLimiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: 2000,
  message: "Too many requests to this endpoint",
});

app.get("/api/data", endpointLimiter, (c) => c.json({ data: "Hono protected data" }));


/*3. Limit Requests per User (AK/SK)

Use x-api-key header as identifier: */

const userLimiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: 10000,
  keyGenerator: (c) => c.req.header("x-api-key") || "anonymous",
  message: "Rate limit exceeded for this API key",
});

app.get("/api/user-data", userLimiter, (c) => {
  return c.json({ message: "User-specific rate-limited data" });
});


app.get("/", (c) => c.text("Hello from Hono!"));

export default app;



/*✅ In production, you’d typically:

Use Redis or Upstash for storing counters across servers.

Apply rate limiting at the API gateway (NGINX, Cloudflare, Kong, etc.) for efficiency. */