// ===== SRP: Logger class handles all logging =====
class APILogger {
  constructor() {
    this.logs = [];
  }

  log(endpoint, method, status) {
    const timestamp = new Date().toISOString();
    const entry = {
      endpoint,
      method,
      status,
      timestamp,
    };
    this.logs.push(entry);
    console.log(`[API LOG] ${method} ${endpoint} => ${status} @ ${timestamp}`);
  }

  getLogs() {
    return this.logs;
  }
}

// ===== SRP: APIClient handles fetching only =====
class APIClient {
  constructor(baseURL, logger) {
    this.baseURL = baseURL;
    this.logger = logger; // DIP: depends on abstraction
  }

  async get(path) {
    const url = `${this.baseURL}${path}`;
    try {
      const response = await fetch(url);
      this.logger.log(path, "GET", response.status);
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.log(path, "GET", "ERROR");
      console.error("GET request failed:", error.message);
    }
  }

  async post(path, payload) {
    const url = `${this.baseURL}${path}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      this.logger.log(path, "POST", response.status);
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.log(path, "POST", "ERROR");
      console.error("POST request failed:", error.message);
    }
  }
}

// ===== USAGE =====
(async () => {
  console.log("=== API Call Logging Started ===");

  const logger = new APILogger();
  const client = new APIClient("https://jsonplaceholder.typicode.com", logger);

  // Make a GET call
  const posts = await client.get("/posts");
  console.log("Received posts:", posts?.length || "None");

  // Make a POST call
  const newPost = await client.post("/posts", {
    title: "Hello World",
    body: "This is a test post.",
    userId: 1,
  });
  console.log("Created post ID:", newPost?.id);

  // View logs
  console.log("\n=== API CALL LOGS ===");
  console.table(logger.getLogs());

  console.log("=== Done ===");
})();
