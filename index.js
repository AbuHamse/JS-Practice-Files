/* Working on different questions for low-level JS for problem-solving */
/** */

function snail(array) {
    const result = [];
    while (array.length) {
      // Step 1: Remove the first row and add to result
      result.push(...array.shift());
  
      // Step 2: Add the last element of each remaining row
      for (let i = 0; i < array.length; i++) {
        result.push(array[i].pop());
      }
  
      // Step 3: Remove the last row and add to result (in reverse order)
      if (array.length) {
        result.push(...array.pop().reverse());
      }
  
      // Step 4: Add the first element of each remaining row (in reverse order)
      for (let i = array.length - 1; i >= 0; i--) {
        result.push(array[i].shift());
      }
    }
    return result;
  }
  
  // Example usage:
  const array = [
    [3, 2, 1],
    [6, 5, 4],
    [9, 8, 7]
  ];
  console.log(snail(array)); // Output: [1, 2, 3, 6, 9, 8, 7, 4, 5]
  
////////////////////////////////////////////////////////
 

/*Question 2 of Exercise  */
function Dictionary(words) {
    this.words = words; // Initialize the dictionary with the words
  }
  
  // Utility function to calculate the "edit distance" between two strings
  function getEditDistance(word1, word2) {
    const dp = Array(word1.length + 1)
      .fill(null)
      .map(() => Array(word2.length + 1).fill(0));
  
    for (let i = 0; i <= word1.length; i++) dp[i][0] = i;
    for (let j = 0; j <= word2.length; j++) dp[0][j] = j;
  
    for (let i = 1; i <= word1.length; i++) {
      for (let j = 1; j <= word2.length; j++) {
        const cost = word1[i - 1] === word2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
  
    return dp[word1.length][word2.length];
  }
  
  Dictionary.prototype.findMostSimilar = function (term) {
    if (!term || typeof term !== 'string') {
      throw new Error('Please enter a valid input string.');
    }
  
    let mostSimilarWord = null;
    let smallestDistance = Infinity;
  
    for (const word of this.words) {
      const distance = getEditDistance(term, word);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        mostSimilarWord = word;
      }
    }
  
    return mostSimilarWord;
  };
  
  // Example Usage:
  const dictionary = new Dictionary(['cherry', 'pineapple', 'melon', 'strawberry', 'raspberry']);
  console.log(dictionary.findMostSimilar('strawbery')); // Output: 'strawberry'
  console.log(dictionary.findMostSimilar(''));     // Output: 'cherry'
  
  /*Class Example for JS */

  class Fetcher {
    constructor(baseURL) {
      this.baseURL = baseURL;
    }
  
    async fetchData(endpoint) {
      try {
        const response = await fetch(`${this.baseURL}${endpoint}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  }
  
  // Example usage:
  const apiFetcher = new Fetcher('https://api.example.com');
  apiFetcher.fetchData('/users').then(data => console.log(data));
  

  /*Class that inheritance the previous Class */

  class ExtendedFetcher extends Fetcher {
    constructor(baseURL, authToken) {
      super(baseURL); // Call the parent class constructor
      this.authToken = authToken; // Additional property for authentication
    }
  
    async fetchWithAuth(endpoint) {
      try {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching data with auth:', error);
      }
    }
  }
  
  // Example usage:
  const secureFetcher = new ExtendedFetcher('https://api.example.com', 'your-auth-token');
  secureFetcher.fetchWithAuth('/secure-data').then(data => console.log(data));
  
  /*
  Explanation
Base Class (Fetcher):

Accepts a baseURL as a parameter.
Has a fetchData method to fetch data from the provided endpoint.
Derived Class (ExtendedFetcher):

Inherits from Fetcher using extends.
Adds an authToken property for authorization.
Includes a new method, fetchWithAuth, to make authenticated requests.
  
  
  
  */

/*
// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;
    // if the argument is the same array, we can be sure the contents are same as well
    if(array === this)
        return true;
    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});


*/