// Simulate user actions using switch and callbacks

function handleUserAction(action, callback) {
  switch (action) {
    case "login":
      console.log("Logging in...");
      simulateAsync("User logged in", callback);
      break;

    case "logout":
      console.log("Logging out...");
      simulateAsync("User logged out", callback);
      break;

    case "viewProfile":
      console.log("Loading profile...");
      simulateAsync("User profile loaded", callback);
      break;

    case "deleteAccount":
      console.log("Deleting account...");
      simulateAsync("Account deleted", callback);
      break;

    default:
      console.log("Unknown action:", action);
      if (typeof callback === "function") {
        callback("Error: Invalid action");
      }
  }
}

// Simulate an async operation (e.g. API call)
function simulateAsync(message, callback) {
  setTimeout(() => {
    console.log("Operation Complete:", message);
    if (typeof callback === "function") {
      callback(null, message);
    }
  }, 1000);
}

// Example usage:
handleUserAction("login", (err, result) => {
  if (err) {
    console.error("Callback Error:", err);
  } else {
    console.log("Callback Success:", result);
  }
});
