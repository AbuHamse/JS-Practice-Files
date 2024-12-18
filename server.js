const snailTrail = (array) => {
    const result = [];
  
    while (array.length) {
      // Step 1: Remove the first row and add to result array
      result.push(...array.shift());
  
      // Step 2: Add the last element of each remaining row
      for (let arr of array) {
        result.push(arr.pop());
      }
  
      // Step 3: Remove the last row of the arrays and add it in reverse
      if (array.length) {
        result.push(...array.pop().reverse());
      }
  
      // Step 4: Add the first element of each remaining row (in reverse order)
      for (let i = array.length - 1; i >= 0; i--) {
        result.push(array[i].shift());
      }
    }
  
    return result;
  };
  
  // Example usage:
  console.log(snailTrail([[1, 2, 3], [4, 5, 6], [7, 8, 9]]));
  // Output: [1, 2, 3, 6, 9, 8, 7, 4, 5]
  