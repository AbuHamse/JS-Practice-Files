// ======= SRP: User class handles only user data =======
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

// ======= SRP: Logger handles only logging =======
class Logger {
  static log(message) {
    console.log(`[Log]: ${message}`);
  }
}

// ======= OCP: Payment methods - each can be extended without modifying others =======
class CreditCardPayment {
  process(amount) {
    console.log(`Processing $${amount} via Credit Card.`);
  }
}

class PayPalPayment {
  process(amount) {
    console.log(`Processing $${amount} via PayPal.`);
  }
}

class CryptoPayment {
  process(amount) {
    console.log(`Processing $${amount} via Crypto Wallet.`);
  }
}

// ======= LSP: This function works with any payment method class =======
function makePayment(paymentMethod, amount) {
  paymentMethod.process(amount); // All payment classes must implement .process()
}

// ======= DIP: High-level module depends on abstraction, not specific classes =======
class PaymentService {
  constructor(paymentMethod) {
    this.paymentMethod = paymentMethod; // Injected dependency
  }

  pay(amount) {
    this.paymentMethod.process(amount);
  }
}

// ======= USAGE =======
console.log("=== Starting Payment Processing ===");

// Create a user
const user1 = new User("Ayanle", "ayanle@example.com");

// Create payment method instances
const cardPayment = new CreditCardPayment();
const paypalPayment = new PayPalPayment();
const cryptoPayment = new CryptoPayment();

// Use PaymentService (DIP) with different payment methods
const cardService = new PaymentService(cardPayment);
cardService.pay(100);

const paypalService = new PaymentService(paypalPayment);
paypalService.pay(50);

const cryptoService = new PaymentService(cryptoPayment);
cryptoService.pay(200);

// Logs
Logger.log("All payments processed successfully.");

console.log("=== Done ===");
g