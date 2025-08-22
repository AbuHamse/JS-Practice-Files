class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, method, data = null) {
    let options = {
      method,
      headers: {
        "Content-Type": "application/json"
      }
    };

    // Handle methods that include a body
    switch (method.toUpperCase()) {
      case "POST":
      case "PUT":
      case "PATCH":
        options.body = JSON.stringify(data);
        break;

      case "GET":
      case "DELETE":
        // no body for GET/DELETE
        break;

      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // Convenience methods (optional)
  get(endpoint) {
    return this.request(endpoint, "GET");
  }

  post(endpoint, data) {
    return this.request(endpoint, "POST", data);
  }

  put(endpoint, data) {
    return this.request(endpoint, "PUT", data);
  }

  delete(endpoint) {
    return this.request(endpoint, "DELETE");
  }
}

// Example usage:
(async () => {
  const api = new ApiService("https://jsonplaceholder.typicode.com");

  try {
    let users = await api.get("/users");       // GET
    console.log("Users:", users);

    let newPost = await api.post("/posts", {   // POST
      title: "foo",
      body: "bar",
      userId: 1
    });
    console.log("New Post:", newPost);

    let updatedPost = await api.put("/posts/1", {   // PUT
      id: 1,
      title: "foo updated",
      body: "bar updated",
      userId: 1
    });
    console.log("Updated Post:", updatedPost);

    await api.delete("/posts/1");   // DELETE
    console.log("Deleted post 1");
  } catch (err) {
    console.error(err);
  }
})();
