// What is Edit Distance?
// Edit Distance (or Levenshtein Distance) is a 
// way to calculate how many operations it takes to transform one 
// string into another. There are 3 types of operations:

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

class Static{
  

    constructor(){
        this.count = 0;
        this.storage = {};

    }
    push(value){
        this.storage[this.count] = value;
        this.count ++;

    }

    pop(){
        if(this.count === 0){
            return undefined;
        }

       this.count--

       let result = this.storage[this.count];
       delete this.storage[this.count];
       return result;  
    }

    size(){
        return this.count
    }

    peek(){
        return this.storage[this.count - 1]
    }
}

const static = new Static();

console.log(static.push(1));
console.log(static.push(2));
console.log(static.push(3));
console.log(static.size());
