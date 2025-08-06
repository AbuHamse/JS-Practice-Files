// What is Edit Distance?
// Edit Distance (or Levenshtein Distance) is a
// way to calculate how many operations it takes to transform one
// string into another. There are 3 types of operations:

const { response } = require("express");

// Insertion: Add a character.
// Deletion: Remove a character.
// Substitution: Replace one character with another.
// For example:

// Transforming "kitten" into "sitting" takes 3 operations:
// Substitute 'k' → 's'
// Substitute 'e' → 'i'
// Add 'g' at the end.
// The edit distance here is 3.

// function Dictionary(words){
//     this.words = words;
// }

// const getEditDistance = ((word1, word2)=>{

//     const dp = Array(word1.length +1)
//     .fill(null)
//     .map(()=> Array(word2.length + 1).fill(0));

//     for(let i= 0; i <= word1.length ;i++) dp[i][0] = i;
//     for(let j= 0; j <= word2.length ;j++) dp[0][j] = j;

// for(let i = 0; i <= word1.length; i++){
//     for(let j = 0; j <= word2.length; j++){
//         const cost = word1[i-1] === word2[j-1] ? 0 : 1;
//         dp[i][j] = Math.min(dp[i-1] [j] + 1, dp[i][j-1] + 1, dp[i-j] + 1)
//     }
// }

// return dp[word1.length][word2.length];

// })

// Dictionary.prototype.findMostSimilar = function(term){
//     if(!term || typeof term !== 'string'){
//         throw new Error('Please Enter correct input.')
//     }

//     let mostSimilarWord = null;
//     let smallestDistance = Infinity;

//     for(const word of this.words){
//         const distance = getEditDistance(term,word);
//         if(distance < smallestDistance){
//             smallestDistance = distance;
//             mostSimilarWord = word;
//         }
//     }
// return mostSimilarWord;
// }

// const dictionary = new Dictionary(['cherry','strawberry','melon', 'kiwi']);
// dictionary.findMostSimilar('lion')

/* Stack Class In JS Algorithim*/

class Static {
  constructor() {
    this.count = 0;
    this.storage = {};
  }
  push(value) {
    this.storage[this.count] = value;
    this.count++;
  }

  pop() {
    if (this.count === 0) {
      return undefined;
    }

    this.count--;

    let result = this.storage[this.count];
    delete this.storage[this.count];
    return result;
  }

  size() {
    return this.count;
  }

  peek() {
    return this.storage[this.count - 1];
  }
}

const static = new Static();

console.log(static.push(1));
console.log(static.push(2));
console.log(static.push(3));
console.log(static.size());

/*

In JavaScript, the constructor is a special method in a class that is automatically called 
when a new instance of the class is created. It is primarily used to initialize the object
 with default or user-provided values. Here's an explanation of why you need a constructor 
 and when to use parameters in it:

Why Do You Need a Constructor?
Initialize Properties:
The constructor is used to define and initialize the properties of an object when it is created.

javascript
Copy code
class Person {
    constructor(name, age) {
        this.name = name; // Initialize the name property
        this.age = age;   // Initialize the age property
    }
}

const person = new Person("Ayanle", 25);
console.log(person); // Output: { name: "Ayanle", age: 25 }
Pass Initial Values:
You can pass values as arguments to the constructor to customize the object during creation.

javascript
Copy code
class Rectangle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}

const rect = new Rectangle(10, 20);
console.log(rect); // Output: { width: 10, height: 20 }
Set Default Values:
A constructor can also define default values for properties if no values are provided.

javascript
Copy code
class Car {
    constructor(brand = "Toyota", year = 2024) {
        this.brand = brand;
        this.year = year;
    }
}

const car1 = new Car(); // No arguments passed
console.log(car1); // Output: { brand: "Toyota", year: 2024 }

const car2 = new Car("Honda", 2023);
console.log(car2); // Output: { brand: "Honda", year: 2023 }
Encapsulation:
The constructor helps encapsulate the setup logic for an object, keeping the creation process clean and organized.

When Should You Use Parameters in a Constructor?
You should use parameters in a constructor when you want to:

Make the Object Configurable:
Allow the user to pass custom values to configure the object.

javascript
Copy code
class User {
    constructor(username, email) {
        this.username = username;
        this.email = email;
    }
}

const user1 = new User("ayanle", "ayanle@example.com");
console.log(user1); // Output: { username: "ayanle", email: "ayanle@example.com" }
Avoid Hardcoding Values:
If you always initialize an object with the same values, it becomes inflexible. Parameters let you avoid hardcoding.

javascript
Copy code
class BankAccount {
    constructor(owner, balance) {
        this.owner = owner;
        this.balance = balance;
    }
}

const account1 = new BankAccount("Ayanle", 1000);
const account2 = new BankAccount("Dirie", 5000);
Provide Reusability:
Parameters make your class reusable by allowing different objects to have different initial states.

javascript
Copy code
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const point1 = new Point(5, 10);
const point2 = new Point(20, 30);
Support Dependency Injection:
You can pass dependencies (e.g., other objects or configurations) to the constructor.

javascript
Copy code
class Logger {
    constructor(serviceName) {
        this.serviceName = serviceName;
    }

    log(message) {
        console.log(`[${this.serviceName}] ${message}`);
    }
}

const appLogger = new Logger("MyApp");
appLogger.log("Application started"); // Output: [MyApp] Application started
When Not to Use Parameters in a Constructor
If the class does not require any external input to initialize its properties.
If you want all instances of the class to have the same default state.
Example:

javascript
Copy code
class Counter {
    constructor() {
        this.count = 0; // Default value
    }

    increment() {
        this.count++;
    }
}

const counter = new Counter();
console.log(counter.count); // Output: 0
Summary
Use the constructor to initialize properties or perform setup tasks when creating an object.
Add parameters to the constructor when you want to customize the object's initial state or pass dependencies.
Avoid parameters if the object always starts with the same default state.

*/

/* Practice Fetcher Class */

class Fetcher {
  constructor(baseUrl) {
    this.baseURL = baseUrl;
  }

  async fetchdata(endpoint) {
    try {
      const response = await fetch(`${this.baseURL} ${endpoint}`);
      if (!response.ok) {
        throw new Error({
          msg: `'Please enter the correct URL' ${response.statusText}`,
        });
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn(error.message);
    }
  }
}

const apiFetcher = new Fetcher("https://jsonplaceholder.typicode.com");
apiFetcher.fetchdata("/posts").then((data) => console.log(data.title));

class ExtendedFetcher extends Fetcher {
  constructor(baseURL, authToken) {
    super(baseURL);
    this.authToken = authToken;
  }

  async fetchWithAuth(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Http Error! Status: ${response.status}`);
      }

      const data = await response.json();
    } catch (error) {
      console.log("Error Fetching data with auth Token", error);
    }
  }
}

/* 
Practice in Making a Set 
First Attempt, Failed but will practice more to understand the whole concept



class MySet{
    constructor(collection){
        this.collection = []
    }

    has(element){
            return (this.collection.indexOf(element) !== -1)
    }

    value(){
        return this.collection
    }

    add(element){
        if(!this.has(element)){
            this.collection.push(element)
            return true
        }
        return false;

    }

    delete(element){
        if(this.has(element)){
           index= this.collection.indexOf(element) - 1;
        this.collection.splice(index, 1)
        return true
        }
        return false
    }

    size(){
        return this.collection.length;
    }

    union(otherSet){
        const unionSet = new MySet();
        const firstSet = this.value();
        const secondSet = otherSet.value();

        firstSet.forEach((e)=>{
            unionSet.add(e)
        })
        secondSet.forEach((e)=>{
            unionSetSet.add(e)
        })

        return unionSet;
    }
}


BELOW IS THE CORRECT VERSION OF THE ABOVE CODE

*/

class MySet {
  constructor(collections = []) {
    this.collections = collections;
  }

  has(element) {
    return this.collections.includes(element);
  }

  add(element) {
    if (!this.has(element)) {
      this.collections.push(element);
      return true;
    }
    return false;
  }

  delete(element) {
    if (this.has(element)) {
      const index = this.collections.indexOf(element) - 1;
      this.collections.splice(index, 1);
      return true;
    }
    return false;
  }

  value() {
    return this.collections;
  }

  size() {
    return this.collections.length;
  }

  union(otherSet) {
    const unionSet = new MySet();
    const firstSet = unionSet.value();
    const secondSet = otherSet.value();

    firstSet.forEach((e) => {
      unionSet.add(e);
    });
    secondSet.forEach((e) => {
      unionSet.add(e);
    });

    return unionSet;
  }

  intersection(otherSet) {
    const intersectedSet = MySet();
    const firstSet = intersectedSet.value();

    firstSet.forEach((e) => {
      if (otherSet.has(e)) {
        intersectedSet.add(e);
      }
    });
  }

  difference(otherSet) {
    const differentSet = MySet();
    const firstSet = differentSet.value();

    firstSet.forEach((e) => {
      if (!otherSet.has(e)) {
        differentSet.add(e);
      }
    });
  }
}
