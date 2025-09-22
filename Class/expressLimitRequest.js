import express from "express";
import rateLimit from "express-rate-limit";

const app = express();

// Limit each IP to 10,000 requests per minute
const ipLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10000,
  message: "Too many requests from this IP, please try again later.",
});

app.use(ipLimiter);

/*Limit Requests per API Endpoint

Apply rate limiting only to a specific route:  */

const endpointLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2000,
  message: "Too many requests to /api/data from this IP.",
});

app.get("/api/data", endpointLimiter, (req, res) => {
  res.json({ data: "Some protected data" });
});


/*3. Limit Requests per User (AK/SK)

Here we assume requests include an API key (req.headers["x-api-key"]).
We’ll store counts in memory (Redis would be better in production). */

const userRequests = {};

function userRateLimiter(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) return res.status(400).json({ error: "API key required" });

  const currentTime = Date.now();
  const windowSize = 60 * 1000; // 1 minute
  const maxRequests = 10000;

  if (!userRequests[apiKey]) {
    userRequests[apiKey] = [];
  }

  // Keep only timestamps within the window
  userRequests[apiKey] = userRequests[apiKey].filter(
    (time) => currentTime - time < windowSize
  );

  if (userRequests[apiKey].length >= maxRequests) {
    return res.status(429).json({ error: "Rate limit exceeded for this user" });
  }

  userRequests[apiKey].push(currentTime);
  next();
}

app.get("/api/user-data", userRateLimiter, (req, res) => {
  res.json({ message: "User-specific rate-limited data" });
});


app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.listen(3000, () => console.log("Server running on port 3000"));


// Limit specific endpoint: /api/data

